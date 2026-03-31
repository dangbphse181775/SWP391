using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

namespace Bike_Link.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly ICartRepository _cartRepo;
        private readonly IWalletRepository _walletRepo;
        private readonly IOrderRepository _orderRepo;
        private readonly ISystemConfigRepository _configRepo;
        private readonly Cloudinary _cloudinary;

        public OrderService(
            ICartRepository cartRepo,
            IWalletRepository walletRepo,
            IOrderRepository orderRepo,
            ISystemConfigRepository configRepo,
            Cloudinary cloudinary)
        {
            _cartRepo = cartRepo;
            _walletRepo = walletRepo;
            _orderRepo = orderRepo;
            _configRepo = configRepo;
            _cloudinary = cloudinary;
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

                // 7a. Tạo Order — status = processing (chờ seller giao)
                var order = new Order
                {
                    BuyerId = buyerId,
                    SellerId = sellerId,
                    Status = "processing",
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

            // 9. Ghi WalletTransaction cho buyer
            string desc = orderIds.Count == 1
                ? $"Thanh toán đơn hàng #{orderIds[0]}"
                : $"Thanh toán {orderIds.Count} đơn hàng (#{string.Join(", #", orderIds)})";

            await _walletRepo.CreatePaymentTransactionAsync(
                wallet.WalletId, totalAmount, desc);

            // 10. Cộng tiền vào Ví Tổng
            var systemWallet = await _walletRepo.GetSystemWalletAsync();
            await _walletRepo.AddBalanceAsync(systemWallet.WalletId, totalAmount);
            await _walletRepo.CreatePaymentTransactionAsync(
                systemWallet.WalletId, totalAmount,
                $"Nhận thanh toán từ buyer #{buyerId} — {desc}");

            // 11. Cập nhật vehicle status → "booked" (chờ giao hàng)
            foreach (var item in selectedItems)
            {
                await _orderRepo.UpdateVehicleStatusAsync(
                    item.VehicleId, "booked");
            }

            // 12. Xoá các CartItem đã mua 
            var vehicleIds = selectedItems.Select(i => i.VehicleId).ToList();
            await _orderRepo.RemoveCartItemsAsync(cart.CartId, vehicleIds);

            // 13. Lấy số dư mới sau khi trừ
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

            // 3. Tính tiền cọc theo config (mặc định 20%)
            decimal depositRate = await _configRepo.GetDecimalAsync("deposit_rate", 0.20m);
            decimal depositAmount = Math.Round(vehicle.Price * depositRate, 0);

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

            // 9. Ghi WalletTransaction cho buyer
            await _walletRepo.CreatePaymentTransactionAsync(
                wallet.WalletId, depositAmount,
                $"Đặt cọc đơn hàng #{orderId} — xe \"{vehicle.Name}\"");

            // 9b. Cộng tiền cọc vào Ví Tổng
            var systemWallet = await _walletRepo.GetSystemWalletAsync();
            await _walletRepo.AddBalanceAsync(systemWallet.WalletId, depositAmount);
            await _walletRepo.CreatePaymentTransactionAsync(
                systemWallet.WalletId, depositAmount,
                $"Nhận tiền cọc đơn #{orderId} từ buyer #{buyerId}");

            // 10. Khóa xe → "booked"
            await _orderRepo.UpdateVehicleStatusAsync(vehicle.VehicleId, "booked");

            // 11. Xoá khỏi giỏ hàng
            await _orderRepo.RemoveCartItemsAsync(
                cart.CartId, new List<int> { vehicle.VehicleId });

            decimal newBalance = await _walletRepo.GetBalanceAsync(buyerId);
            int expiryHours = await _configRepo.GetIntAsync("deposit_expiry_hours", 72);

            return new DepositResultDto
            {
                Success = true,
                OrderId = orderId,
                VehiclePrice = vehicle.Price,
                DepositAmount = depositAmount,
                WalletBalance = newBalance,
                DepositExpiry = DateTime.UtcNow.AddHours(expiryHours),
                Message = $"Đặt cọc thành công! Đã trừ {depositAmount:N0}đ. Vui lòng thanh toán nốt trong {expiryHours}h."
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

            // 2. Kiểm tra còn trong hạn không
            int expiryHours = await _configRepo.GetIntAsync("deposit_expiry_hours", 72);
            var expiry = order.CreatedAt.AddHours(expiryHours);
            if (DateTime.UtcNow > expiry)
                throw new Exception($"Đã quá hạn {expiryHours}h. Đơn cọc sẽ được xử lý tự động.");

            // 3. Tính hoàn tiền theo config (mặc định 95%), phạt cho seller
            decimal cancelRefundRate = await _configRepo.GetDecimalAsync("cancel_refund_rate", 0.95m);
            decimal depositAmount = order.DepositAmount ?? 0;
            decimal refundAmount = Math.Round(depositAmount * cancelRefundRate, 0);
            decimal penaltyAmount = depositAmount - refundAmount;

            // 4. Cập nhật Order → "cancelled"
            await _orderRepo.UpdateOrderStatusAsync(orderId, "cancelled");

            // 5. Trừ toàn bộ tiền cọc từ Ví Tổng
            var systemWallet = await _walletRepo.GetSystemWalletAsync();
            await _walletRepo.DeductBalanceAsync(systemWallet.WalletId, depositAmount);
            await _walletRepo.CreatePaymentTransactionAsync(
                systemWallet.WalletId, depositAmount,
                $"Hoàn cọc + phạt hủy đơn #{orderId}");

            // 6. Hoàn tiền vào ví buyer
            Wallet wallet = await _walletRepo.GetByUserIdAsync(buyerId);
            if (wallet == null)
                throw new Exception("Không tìm thấy ví người mua");

            await _walletRepo.AddBalanceAsync(wallet.WalletId, refundAmount);
            await _walletRepo.CreatePaymentTransactionAsync(
                wallet.WalletId, refundAmount,
                $"Hoàn tiền cọc đơn hàng #{orderId} ({cancelRefundRate * 100:0.##}%)", "success");

            // 7. Chuyển phạt cho seller
            Wallet sellerWallet = await _walletRepo.GetByUserIdAsync(order.SellerId);
            if (sellerWallet != null && penaltyAmount > 0)
            {
                await _walletRepo.AddBalanceAsync(sellerWallet.WalletId, penaltyAmount);
                await _walletRepo.CreatePaymentTransactionAsync(
                    sellerWallet.WalletId, penaltyAmount,
                    $"Nhận phí phạt hủy cọc đơn #{orderId} ({(1 - cancelRefundRate) * 100:0.##}%)", "success");
            }

            // 8. Giải phóng xe → "active"
            await ReleaseVehicleFromOrder(orderId);

            decimal newBalance = await _walletRepo.GetBalanceAsync(buyerId);

            return new CancelDepositResultDto
            {
                Success = true,
                OrderId = orderId,
                RefundAmount = refundAmount,
                WalletBalance = newBalance,
                Message = $"Hủy cọc thành công! Đã hoàn {refundAmount:N0}đ ({cancelRefundRate * 100:0.##}%) vào ví. Phí phạt {penaltyAmount:N0}đ ({(1 - cancelRefundRate) * 100:0.##}%) đã chuyển cho seller."
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

            // 2. Kiểm tra còn trong hạn không
            int expiryHours = await _configRepo.GetIntAsync("deposit_expiry_hours", 72);
            var expiry = order.CreatedAt.AddHours(expiryHours);
            if (DateTime.UtcNow > expiry)
                throw new Exception($"Đã quá hạn {expiryHours}h. Đơn cọc đã bị hủy tự động.");

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

            // 6. Ghi WalletTransaction cho buyer
            await _walletRepo.CreatePaymentTransactionAsync(
                wallet.WalletId, remainingAmount,
                $"Thanh toán khoản còn lại đơn hàng #{orderId}");

            // 6b. Cộng tiền vào Ví Tổng
            var systemWallet = await _walletRepo.GetSystemWalletAsync();
            await _walletRepo.AddBalanceAsync(systemWallet.WalletId, remainingAmount);
            await _walletRepo.CreatePaymentTransactionAsync(
                systemWallet.WalletId, remainingAmount,
                $"Nhận thanh toán khoản còn lại đơn #{orderId} từ buyer #{buyerId}");

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

            // 8. Cập nhật Order → "processing" (chờ seller giao)
            await _orderRepo.UpdateOrderStatusAsync(orderId, "processing");

            // Vehicle giữ nguyên "booked" — chưa sold cho đến buyer confirm

            decimal newBalance = await _walletRepo.GetBalanceAsync(buyerId);

            return new PayRemainingResultDto
            {
                Success = true,
                OrderId = orderId,
                RemainingAmount = remainingAmount,
                WalletBalance = newBalance,
                Message = $"Thanh toán thành công! Đã trừ {remainingAmount:N0}đ (khoản còn lại). Chờ seller giao hàng."
            };
        }

        // ===================== XỬ LÝ HẾT HẠN 72H =====================

        public async Task ProcessExpiredDepositsAsync()
        {
            var expiredOrders = await _orderRepo.GetExpiredDepositOrdersAsync();
            var systemWallet = await _walletRepo.GetSystemWalletAsync();

            foreach (var order in expiredOrders)
            {
                decimal depositAmount = order.DepositAmount ?? 0;
                decimal expiredSellerRate = await _configRepo.GetDecimalAsync("expired_seller_rate", 0.80m);
                decimal sellerShare = Math.Round(depositAmount * expiredSellerRate, 0);
                decimal systemKeep = depositAmount - sellerShare;

                // 1. Cập nhật Order → "cancelled"
                await _orderRepo.UpdateOrderStatusAsync(order.OrderId, "cancelled");

                // 2. Trừ tiền cọc từ Ví Tổng
                await _walletRepo.DeductBalanceAsync(systemWallet.WalletId, sellerShare);

                // 3. Chuyển cho seller
                Wallet sellerWallet = await _walletRepo.GetByUserIdAsync(order.SellerId);
                if (sellerWallet != null)
                {
                    await _walletRepo.AddBalanceAsync(sellerWallet.WalletId, sellerShare);
                    await _walletRepo.CreatePaymentTransactionAsync(
                        sellerWallet.WalletId, sellerShare,
                        $"Nhận {expiredSellerRate * 100:0.##}% tiền cọc quá hạn đơn #{order.OrderId}", "success");
                }

                // 4. Ghi transaction cho Ví Tổng
                await _walletRepo.CreatePaymentTransactionAsync(
                    systemWallet.WalletId, sellerShare,
                    $"Chuyển {expiredSellerRate * 100:0.##}% cọc đơn #{order.OrderId} cho seller #{order.SellerId}");
                if (systemKeep > 0)
                {
                    await _walletRepo.CreatePaymentTransactionAsync(
                        systemWallet.WalletId, systemKeep,
                        $"Giữ lại {(1 - expiredSellerRate) * 100:0.##}% cọc đơn #{order.OrderId} (phí hệ thống)");
                }

                // 5. Ghi WalletTransaction cho buyer (thông báo mất cọc)
                Wallet buyerWallet = await _walletRepo.GetByUserIdAsync(order.BuyerId);
                if (buyerWallet != null)
                {
                    await _walletRepo.CreatePaymentTransactionAsync(
                        buyerWallet.WalletId, depositAmount,
                        $"Mất tiền cọc đơn hàng #{order.OrderId} — quá hạn", "failed");
                }

                // 6. Giải phóng xe → "active"
                await ReleaseVehicleFromOrder(order.OrderId);
            }
        }

        // ===================== SELLER XÁC NHẬN GIAO HÀNG =====================

        public async Task SellerConfirmShippedAsync(int sellerId, int orderId, IFormFile shippingProof)
        {
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            if (order.SellerId != sellerId)
                throw new Exception("Bạn không có quyền xác nhận đơn hàng này");

            var normalizedStatus = order.Status?.ToLower();
            if (normalizedStatus != "processing" && normalizedStatus != "paid")
                throw new Exception($"Đơn hàng không ở trạng thái chờ giao (status: {order.Status})");

            if (shippingProof == null || shippingProof.Length == 0)
                throw new Exception("Vui lòng cung cấp hình ảnh bằng chứng giao hàng");

            // Upload ảnh lên Cloudinary
            using var stream = shippingProof.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(shippingProof.FileName, stream),
                Folder = "orders/shipping-proof"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
            {
                throw new Exception($"Lỗi khi upload ảnh bằng chứng: {uploadResult.Error.Message}");
            }

            string proofUrl = uploadResult.SecureUrl.ToString();

            // Cập nhật status và url
            await _orderRepo.UpdateOrderShippingProofAsync(orderId, proofUrl);
        }

        // ===================== BUYER XÁC NHẬN NHẬN HÀNG =====================

        public async Task BuyerConfirmReceivedAsync(int buyerId, int orderId)
        {
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            if (order.BuyerId != buyerId)
                throw new Exception("Bạn không có quyền xác nhận đơn hàng này");

            if (order.Status != "shipped")
                throw new Exception($"Đơn hàng chưa được giao (status: {order.Status})");

            // 1. Order → "completed"
            await _orderRepo.UpdateOrderStatusAsync(orderId, "completed");

            // 2. Vehicle → "sold"
            var vehicleIds = await _orderRepo.GetVehicleIdsByOrderIdAsync(orderId);
            foreach (var vid in vehicleIds)
            {
                await _orderRepo.UpdateVehicleStatusAsync(vid, "sold");
            }

            // 3. Chuyển tiền từ Ví Tổng → Ví Seller
            var systemWallet = await _walletRepo.GetSystemWalletAsync();
            decimal amount = order.Amount;

            await _walletRepo.DeductBalanceAsync(systemWallet.WalletId, amount);
            await _walletRepo.CreatePaymentTransactionAsync(
                systemWallet.WalletId, amount,
                $"Chuyển tiền đơn #{orderId} cho seller #{order.SellerId}");

            Wallet sellerWallet = await _walletRepo.GetByUserIdAsync(order.SellerId);
            if (sellerWallet != null)
            {
                await _walletRepo.AddBalanceAsync(sellerWallet.WalletId, amount);
                await _walletRepo.CreatePaymentTransactionAsync(
                    sellerWallet.WalletId, amount,
                    $"Nhận tiền đơn hàng #{orderId} — buyer đã xác nhận nhận hàng", "success");
            }
        }




        // ===================== LẤY CHI TIẾT ĐƠN HÀNG =====================

        public async Task<OrderDetailResponseDto?> GetOrderByOrderIdAsync(int orderId)
        {
            var order = await _orderRepo.GetOrderDetailByIdAsync(orderId);
            
            if (order == null)
                return null;

            return new OrderDetailResponseDto
            {
                OrderId = order.OrderId,
                
                // Chỉ hiện FullName và Phone của Buyer
                BuyerName = order.Buyer.FullName ?? "N/A",
                BuyerPhone = order.Buyer.Phone,
                
                SellerId = order.SellerId.ToString(),
                SellerName = order.Seller.FullName ?? "N/A",
                SellerPhone = order.Seller.Phone,
                
                Status = order.Status,
                Amount = order.Amount,
                DepositAmount = order.DepositAmount,
                ShippingProofUrl = order.ShippingProofUrl,
                
                CreatedAt = order.CreatedAt,
                
                
                OrderItems = order.OrderDetails.Select(od => new OrderItemDto
                {
                    VehicleId = od.VehicleId,
                    VehicleName = od.Vehicle?.Name ?? "N/A",
                    ThumbnailUrl = od.Vehicle?.VehicleMedia
                        .FirstOrDefault(m => m.Type == "image")?.Url,
                    Quantity = od.Quantity,
                    Price = od.Price
                }).ToList(),
                
                Shipping = order.Shipping == null ? null : new OrderShippingDto
                {
                    RecipientName = order.Shipping.RecipientName,
                    RecipientPhone = order.Shipping.RecipientPhone,
                    ShippingAddress = order.Shipping.ShippingAddress,
                    Note = order.Shipping.Note
                }
            };
        }

        // ===================== HELPER =====================

        private async Task ReleaseVehicleFromOrder(int orderId)
        {
            var vehicleIds = await _orderRepo.GetVehicleIdsByOrderIdAsync(orderId);
            foreach (var vid in vehicleIds)
            {
                await _orderRepo.UpdateVehicleStatusAsync(vid, "active");
            }
        }

        public async Task<List<OrderListDto>> GetOrdersByUserIdAsync(int userId, string role)
        {
            var orders = await _orderRepo.GetOrdersByUserIdAsync(userId, role);

            return orders.Select(o => new OrderListDto
            {
                OrderId = o.OrderId,
                BuyerName = o.Buyer?.FullName ?? "N/A",
                SellerName = o.Seller?.FullName ?? "N/A",
                Status = o.Status,
                Amount = o.Amount,
                CreatedAt = o.CreatedAt,
                Items = o.OrderDetails.Select(od => new OrderItemSummaryDto
                {
                    VehicleId = od.VehicleId,
                    VehicleName = od.Vehicle?.Name ?? "N/A",
                    Price = od.Price,
                    ThumbnailUrl = od.Vehicle?.VehicleMedia?.FirstOrDefault(m => m.Type == "image")?.Url
                }).ToList()
            }).ToList();
}
    }
}
