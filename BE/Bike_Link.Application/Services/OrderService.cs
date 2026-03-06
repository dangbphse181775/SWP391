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

            // 11. Xoá các CartItem đã mua 
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

        // ===================== ĐẶT CỌC =====================

        public async Task<DepositResultDto> DepositAsync(
            int buyerId, DepositOrderRequest request)
        {
            // 1. Lấy Cart để lấy thông tin Vehicle (đã Include qua EF)
            Cart cart = await _cartRepo.GetByUserIdAsync(buyerId);
            if (cart == null)
                throw new Exception("Giỏ hàng trống");

            var cartItem = cart.CartItems
                .FirstOrDefault(ci => ci.VehicleId == request.VehicleId);

            if (cartItem == null || cartItem.Vehicle == null)
                throw new Exception("Không tìm thấy xe trong giỏ hàng. Vui lòng thêm vào giỏ trước.");

            var vehicle = cartItem.Vehicle;

            // 2. Validate
            if (!string.Equals(vehicle.Status, "active", StringComparison.OrdinalIgnoreCase))
                throw new Exception($"Xe \"{vehicle.Name}\" không còn khả dụng (status: {vehicle.Status})");

            if (vehicle.SellerId == buyerId)
                throw new Exception("Bạn không thể đặt cọc xe do chính mình đăng bán");

            // 3. Tính tiền cọc = 20% giá trị xe
            decimal depositAmount = Math.Round(vehicle.Price * 0.20m, 0);

            // 4. Kiểm tra ví
            Wallet wallet = await _walletRepo.GetByUserIdAsync(buyerId);
            if (wallet == null)
                throw new Exception("Bạn chưa có ví. Vui lòng liên hệ hỗ trợ.");

            if (wallet.Balance < depositAmount)
            {
                // Ghi lịch sử thất bại
                await _walletRepo.CreatePaymentTransactionAsync(
                    wallet.WalletId, depositAmount,
                    $"Đặt cọc thất bại xe \"{vehicle.Name}\" — thiếu {(depositAmount - wallet.Balance):N0}đ",
                    "failed");

                return new DepositResultDto
                {
                    Success = false,
                    VehiclePrice = vehicle.Price,
                    DepositAmount = depositAmount,
                    WalletBalance = wallet.Balance,
                    AmountShort = depositAmount - wallet.Balance,
                    Message = $"Số dư ví không đủ để đặt cọc. Cần nạp thêm {(depositAmount - wallet.Balance):N0}đ."
                };
            }

            // ========== ĐỦ TIỀN → TIẾN HÀNH ĐẶT CỌC ==========

            // 5. Tạo Order status = "deposited"
            var order = new Order
            {
                BuyerId = buyerId,
                SellerId = vehicle.SellerId,
                Status = "deposited",
                Amount = vehicle.Price,
                DepositAmount = depositAmount,
                CreatedAt = DateTime.UtcNow
            };

            int orderId = await _orderRepo.CreateOrderAsync(order);

            // 6. Tạo OrderDetail
            await _orderRepo.CreateOrderDetailAsync(new OrderDetail
            {
                OrderId = orderId,
                VehicleId = vehicle.VehicleId,
                Quantity = 1,
                Price = vehicle.Price
            });

            // 7. Tạo Payment record
            await _orderRepo.CreatePaymentAsync(new Payment
            {
                OrderId = orderId,
                Amount = depositAmount,
                Method = "wallet",
                Provider = "BikeLink Wallet",
                TransactionCode = Guid.NewGuid().ToString(),
                Status = "success"
            });

            // 8. Trừ ví buyer
            bool deducted = await _walletRepo.DeductBalanceAsync(
                wallet.WalletId, depositAmount);
            if (!deducted)
                throw new Exception("Số dư ví đã thay đổi. Vui lòng thử lại.");

            // 9. Ghi WalletTransaction
            await _walletRepo.CreatePaymentTransactionAsync(
                wallet.WalletId, depositAmount,
                $"Đặt cọc đơn hàng #{orderId} — xe \"{vehicle.Name}\"");

            // 10. Khóa xe → "booked"
            await _orderRepo.UpdateVehicleStatusAsync(vehicle.VehicleId, "booked");

            // 11. Xoá khỏi giỏ hàng
            await _orderRepo.RemoveCartItemsAsync(
                cart.CartId, new List<int> { vehicle.VehicleId });

            decimal newBalance = await _walletRepo.GetBalanceAsync(buyerId);

            return new DepositResultDto
            {
                Success = true,
                OrderId = orderId,
                VehiclePrice = vehicle.Price,
                DepositAmount = depositAmount,
                WalletBalance = newBalance,
                DepositExpiry = DateTime.UtcNow.AddHours(72),
                Message = $"Đặt cọc thành công! Đã trừ {depositAmount:N0}đ. Vui lòng thanh toán nốt trong 72h."
            };
        }

        // ===================== HỦY CỌC =====================

        public async Task<CancelDepositResultDto> CancelDepositAsync(
            int buyerId, int orderId)
        {
            // 1. Lấy Order
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            if (order.BuyerId != buyerId)
                throw new Exception("Bạn không có quyền hủy đơn hàng này");

            if (order.Status != "deposited")
                throw new Exception($"Đơn hàng không thể hủy (status hiện tại: {order.Status})");

            // 2. Kiểm tra còn trong hạn 72h không
            var expiry = order.CreatedAt.AddHours(72);
            if (DateTime.UtcNow > expiry)
                throw new Exception("Đã quá hạn 72h. Đơn cọc sẽ được xử lý tự động.");

            // 3. Tính hoàn 95% tiền cọc
            decimal depositAmount = order.DepositAmount ?? 0;
            decimal refundAmount = Math.Round(depositAmount * 0.95m, 0);

            // 4. Cập nhật Order → "cancelled"
            await _orderRepo.UpdateOrderStatusAsync(orderId, "cancelled");

            // 5. Hoàn tiền vào ví buyer
            Wallet wallet = await _walletRepo.GetByUserIdAsync(buyerId);
            if (wallet == null)
                throw new Exception("Không tìm thấy ví người mua");

            await _walletRepo.AddBalanceAsync(wallet.WalletId, refundAmount);

            // 6. Ghi WalletTransaction — refund
            await _walletRepo.CreatePaymentTransactionAsync(
                wallet.WalletId, refundAmount,
                $"Hoàn tiền cọc đơn hàng #{orderId} (95%)", "success");

            // 7. Giải phóng xe → "active"
            
            await ReleaseVehicleFromOrder(orderId);

            decimal newBalance = await _walletRepo.GetBalanceAsync(buyerId);

            return new CancelDepositResultDto
            {
                Success = true,
                OrderId = orderId,
                RefundAmount = refundAmount,
                WalletBalance = newBalance,
                Message = $"Hủy cọc thành công! Đã hoàn {refundAmount:N0}đ (95%) vào ví."
            };
        }

        // ===================== THANH TOÁN KHOẢN CÒN LẠI =====================

        public async Task<PayRemainingResultDto> PayRemainingAsync(
            int buyerId, int orderId)
        {
            // 1. Lấy Order
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            if (order.BuyerId != buyerId)
                throw new Exception("Bạn không có quyền thanh toán đơn hàng này");

            if (order.Status != "deposited")
                throw new Exception($"Đơn hàng không ở trạng thái đặt cọc (status hiện tại: {order.Status})");

            // 2. Kiểm tra còn trong hạn 72h không
            var expiry = order.CreatedAt.AddHours(72);
            if (DateTime.UtcNow > expiry)
                throw new Exception("Đã quá hạn 72h. Đơn cọc đã bị hủy tự động.");

            // 3. Tính khoản còn lại = tổng giá - tiền cọc
            decimal depositAmount = order.DepositAmount ?? 0;
            decimal remainingAmount = order.Amount - depositAmount;

            // 4. Kiểm tra ví
            Wallet wallet = await _walletRepo.GetByUserIdAsync(buyerId);
            if (wallet == null)
                throw new Exception("Bạn chưa có ví. Vui lòng liên hệ hỗ trợ 0944242035");

            if (wallet.Balance < remainingAmount)
            {
                // Ghi lịch sử thất bại
                await _walletRepo.CreatePaymentTransactionAsync(
                    wallet.WalletId, remainingAmount,
                    $"Thanh toán khoản còn lại đơn #{orderId} thất bại — thiếu {(remainingAmount - wallet.Balance):N0}đ",
                    "failed");

                return new PayRemainingResultDto
                {
                    Success = false,
                    OrderId = orderId,
                    RemainingAmount = remainingAmount,
                    WalletBalance = wallet.Balance,
                    AmountShort = remainingAmount - wallet.Balance,
                    Message = $"Số dư ví không đủ. Cần nạp thêm {(remainingAmount - wallet.Balance):N0}đ để thanh toán."
                };
            }

            // ========== ĐỦ TIỀN → THANH TOÁN ==========

            // 5. Trừ ví buyer
            bool deducted = await _walletRepo.DeductBalanceAsync(
                wallet.WalletId, remainingAmount);
            if (!deducted)
                throw new Exception("Số dư ví đã thay đổi. Vui lòng thử lại.");

            // 6. Ghi WalletTransaction
            await _walletRepo.CreatePaymentTransactionAsync(
                wallet.WalletId, remainingAmount,
                $"Thanh toán khoản còn lại đơn hàng #{orderId}");

            // 7. Tạo Payment record cho khoản còn lại
            await _orderRepo.CreatePaymentAsync(new Payment
            {
                OrderId = orderId,
                Amount = remainingAmount,
                Method = "wallet",
                Provider = "BikeLink Wallet",
                TransactionCode = Guid.NewGuid().ToString(),
                Status = "success"
            });

            // 8. Cập nhật Order → "paid"
            await _orderRepo.UpdateOrderStatusAsync(orderId, "paid");

            // 9. Cập nhật vehicle → "sold"
            var vehicleIds = await _orderRepo.GetVehicleIdsByOrderIdAsync(orderId);
            foreach (var vid in vehicleIds)
            {
                await _orderRepo.UpdateVehicleStatusAsync(vid, "sold");
            }

            decimal newBalance = await _walletRepo.GetBalanceAsync(buyerId);

            return new PayRemainingResultDto
            {
                Success = true,
                OrderId = orderId,
                RemainingAmount = remainingAmount,
                WalletBalance = newBalance,
                Message = $"Thanh toán thành công! Đã trừ {remainingAmount:N0}đ (khoản còn lại). Tổng đã thanh toán: {order.Amount:N0}đ."
            };
        }

        // ===================== XỬ LÝ HẾT HẠN 72H =====================

        public async Task ProcessExpiredDepositsAsync()
        {
            var expiredOrders = await _orderRepo.GetExpiredDepositOrdersAsync();

            foreach (var order in expiredOrders)
            {
                decimal depositAmount = order.DepositAmount ?? 0;

                // 1. Cập nhật Order → "cancelled"
                await _orderRepo.UpdateOrderStatusAsync(order.OrderId, "cancelled");

                // 2. Chuyển tiền cọc cho seller
                Wallet sellerWallet = await _walletRepo.GetByUserIdAsync(order.SellerId);
                if (sellerWallet != null)
                {
                    await _walletRepo.AddBalanceAsync(sellerWallet.WalletId, depositAmount);

                    await _walletRepo.CreatePaymentTransactionAsync(
                        sellerWallet.WalletId, depositAmount,
                        $"Nhận tiền cọc quá hạn đơn hàng #{order.OrderId}", "success");
                }

                // 3. Ghi WalletTransaction cho buyer (thông báo mất cọc)
                Wallet buyerWallet = await _walletRepo.GetByUserIdAsync(order.BuyerId);
                if (buyerWallet != null)
                {
                    await _walletRepo.CreatePaymentTransactionAsync(
                        buyerWallet.WalletId, depositAmount,
                        $"Mất tiền cọc đơn hàng #{order.OrderId} — quá hạn 72h", "failed");
                }

                // 4. Giải phóng xe → "active"
                await ReleaseVehicleFromOrder(order.OrderId);
            }
        }

        // ===================== HELPER =====================

        /// <summary>
        /// Lấy VehicleId từ OrderDetail rồi chuyển status về "active"
        /// </summary>
        private async Task ReleaseVehicleFromOrder(int orderId)
        {
            // Sử dụng raw query thông qua OrderRepository
            // Lấy VehicleId từ OrderDetail có OrderId tương ứng
            // Vì deposit chỉ 1 xe nên lấy xe đầu tiên
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null) return;

            // Dùng method có sẵn - cần thêm method lấy VehicleId từ OrderDetail
            // Tạm workaround: thêm method GetVehicleIdsByOrderIdAsync vào repo
            var vehicleIds = await _orderRepo.GetVehicleIdsByOrderIdAsync(orderId);
            foreach (var vid in vehicleIds)
            {
                await _orderRepo.UpdateVehicleStatusAsync(vid, "active");
            }
        }
    }
}
