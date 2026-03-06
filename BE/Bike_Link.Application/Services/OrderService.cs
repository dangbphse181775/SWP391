using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;

namespace Bike_Link.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly ICartRepository _cartRepo;
        private readonly IWalletRepository _walletRepo;
        private readonly IOrderRepository _orderRepo;

        public OrderService(
            ICartRepository cartRepo,
            IWalletRepository walletRepo,
            IOrderRepository orderRepo)
        {
            _cartRepo = cartRepo;
            _walletRepo = walletRepo;
            _orderRepo = orderRepo;
        }

        public async Task<CheckoutResultDto> CheckoutAsync(
            int buyerId, CheckoutRequest request)
        {
            // 1. Validate request
            if (request.VehicleIds == null || !request.VehicleIds.Any())
                throw new Exception("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");

            // 2. Lấy Cart của buyer (đã Include Vehicle qua EF Core)
            Cart cart = await _cartRepo.GetByUserIdAsync(buyerId);
            if (cart == null || !cart.CartItems.Any())
                throw new Exception("Giỏ hàng trống");

            // 3. Lọc các CartItem theo VehicleIds yêu cầu
            var selectedItems = cart.CartItems
                .Where(ci => request.VehicleIds.Contains(ci.VehicleId))
                .ToList();

            if (!selectedItems.Any())
                throw new Exception("Không tìm thấy sản phẩm đã chọn trong giỏ hàng");

            // 4. Kiểm tra từng vehicle (đã load sẵn qua Cart Include)
            foreach (var item in selectedItems)
            {
                var vehicle = item.Vehicle;
                if (vehicle == null)
                    throw new Exception($"Không tìm thấy xe đạp #{item.VehicleId}");

                if (!string.Equals(vehicle.Status, "active", StringComparison.OrdinalIgnoreCase))
                    throw new Exception($"Xe \"{vehicle.Name}\" không còn khả dụng (status: {vehicle.Status})");

                if (vehicle.SellerId == buyerId)
                    throw new Exception($"Bạn không thể mua xe \"{vehicle.Name}\" do chính mình đăng bán");
            }

            // 5. Tính tổng tiền
            decimal totalAmount = selectedItems
                .Sum(ci => ci.Vehicle.Price * ci.Quantity);

            // 6. Kiểm tra ví
            Wallet wallet = await _walletRepo.GetByUserIdAsync(buyerId);
            if (wallet == null)
                throw new Exception("Bạn chưa có ví. Vui lòng liên hệ hỗ trợ.");

            if (wallet.Balance < totalAmount)
            {
                // Ghi lịch sử giao dịch thất bại
                await _walletRepo.CreatePaymentTransactionAsync(
                    wallet.WalletId,
                    totalAmount,
                    $"Thanh toán thất bại — thiếu {(totalAmount - wallet.Balance):N0}đ",
                    "failed"
                );

                // Thiếu tiền → trả về thông tin để FE hiển thị
                return new CheckoutResultDto
                {
                    Success = false,
                    TotalAmount = totalAmount,
                    WalletBalance = wallet.Balance,
                    AmountShort = totalAmount - wallet.Balance,
                    Message = $"Số dư ví không đủ. Bạn cần nạp thêm {(totalAmount - wallet.Balance):N0}đ để thanh toán."
                };
            }

            // ========== ĐỦ TIỀN → TIẾN HÀNH THANH TOÁN ==========

            // 7. Group cart items theo SellerId → tạo 1 Order / seller
            var groupedBySeller = selectedItems
                .GroupBy(ci => ci.Vehicle.SellerId)
                .ToList();

            var orderIds = new List<int>();

            foreach (var group in groupedBySeller)
            {
                int sellerId = group.Key;
                decimal orderAmount = group.Sum(ci => ci.Vehicle.Price * ci.Quantity);

                // 7a. Tạo Order
                var order = new Order
                {
                    BuyerId = buyerId,
                    SellerId = sellerId,
                    Status = "paid",
                    Amount = orderAmount,
                    CreatedAt = DateTime.UtcNow
                };

                int orderId = await _orderRepo.CreateOrderAsync(order);
                orderIds.Add(orderId);

                // 7b. Tạo OrderDetails
                foreach (var item in group)
                {
                    var detail = new OrderDetail
                    {
                        OrderId = orderId,
                        VehicleId = item.VehicleId,
                        Quantity = item.Quantity,
                        Price = item.Vehicle.Price
                    };
                    await _orderRepo.CreateOrderDetailAsync(detail);
                }

                // 7c. Tạo Payment record
                var payment = new Payment
                {
                    OrderId = orderId,
                    Amount = orderAmount,
                    Method = "wallet",
                    Provider = "BikeLink Wallet",
                    TransactionCode = Guid.NewGuid().ToString(),
                    Status = "success"
                };
                await _orderRepo.CreatePaymentAsync(payment);
            }

            // 8. Trừ ví buyer
            bool deducted = await _walletRepo.DeductBalanceAsync(
                wallet.WalletId, totalAmount);

            if (!deducted)
            {
                throw new Exception("Số dư ví đã thay đổi. Vui lòng thử lại.");
            }

            // 9. Ghi WalletTransaction type = "payment"
            string desc = orderIds.Count == 1
                ? $"Thanh toán đơn hàng #{orderIds[0]}"
                : $"Thanh toán {orderIds.Count} đơn hàng (#{string.Join(", #", orderIds)})";

            await _walletRepo.CreatePaymentTransactionAsync(
                wallet.WalletId, totalAmount, desc);

            // 10. Cập nhật vehicle status → "sold"
            foreach (var item in selectedItems)
            {
                await _orderRepo.UpdateVehicleStatusAsync(
                    item.VehicleId, "sold");
            }

            // 11. Xoá các CartItem đã mua (raw SQL — tránh EF tracking conflict)
            var vehicleIds = selectedItems.Select(i => i.VehicleId).ToList();
            await _orderRepo.RemoveCartItemsAsync(cart.CartId, vehicleIds);

            // 12. Lấy số dư mới sau khi trừ
            decimal newBalance = await _walletRepo.GetBalanceAsync(buyerId);

            return new CheckoutResultDto
            {
                Success = true,
                OrderIds = orderIds,
                TotalAmount = totalAmount,
                WalletBalance = newBalance,
                Message = $"Thanh toán thành công! Đã trừ {totalAmount:N0}đ từ ví."
            };
        }
    }
}
