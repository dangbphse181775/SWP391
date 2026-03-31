using System.Text.Json;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Bike_Link.Application.Services
{
    public class DisputeService : IDisputeService
    {
        private readonly IDisputeRepository _disputeRepo;
        private readonly IOrderRepository _orderRepo;
        private readonly IWalletRepository _walletRepo;
        private readonly ISystemConfigRepository _configRepo;
        private readonly Cloudinary _cloudinary;

        public DisputeService(
            IDisputeRepository disputeRepo,
            IOrderRepository orderRepo,
            IWalletRepository walletRepo,
            ISystemConfigRepository configRepo,
            Cloudinary cloudinary)
        {
            _disputeRepo = disputeRepo;
            _orderRepo = orderRepo;
            _walletRepo = walletRepo;
            _configRepo = configRepo;
            _cloudinary = cloudinary;
        }

        // ===================== UPLOAD ẢNH CHAT =====================

        public async Task<DisputeChatDto> UploadChatImageAsync(
            int disputeId, int senderId, string role,
            string channel, Microsoft.AspNetCore.Http.IFormFile image, string? caption)
        {
            // 1. Validate channel
            if (channel != "buyer" && channel != "seller")
                throw new Exception("Channel phải là 'buyer' hoặc 'seller'");

            // 2. Validate dispute tồn tại
            var dispute = await _disputeRepo.GetDisputeByIdAsync(disputeId);
            if (dispute == null)
                throw new Exception("Không tìm thấy khiếu nại");

            // 3. Validate quyền truy cập channel
            bool isStaff = role.Equals("Admin", StringComparison.OrdinalIgnoreCase)
                        || role.Equals("Inspector", StringComparison.OrdinalIgnoreCase);

            if (!isStaff)
            {
                if (channel == "buyer" && dispute.Order.BuyerId != senderId)
                    throw new Exception("Bạn không có quyền gửi ảnh vào kênh này");
                if (channel == "seller" && dispute.Order.SellerId != senderId)
                    throw new Exception("Bạn không có quyền gửi ảnh vào kênh này");
            }

            // 4. Upload ảnh lên Cloudinary
            using var stream = image.OpenReadStream();
            var upload = await _cloudinary.UploadAsync(new ImageUploadParams
            {
                File = new FileDescription(image.FileName, stream),
                Folder = "disputes/chat"
            });

            if (upload.Error != null)
                throw new Exception($"Upload ảnh thất bại: {upload.Error.Message}");

            var imageUrl = upload.SecureUrl.ToString();

            // 5. Lưu tin nhắn chat vào DB
            var chat = new DisputeChat
            {
                DisputeId = disputeId,
                SenderId = senderId,
                Channel = channel,
                Message = caption ?? "",
                ImageUrl = imageUrl,
                SentAt = DateTime.UtcNow
            };

            await _disputeRepo.AddChatMessageAsync(chat);

            // 6. Trả về DTO
            return new DisputeChatDto
            {
                DisputeChatId = chat.DisputeChatId,
                SenderId = senderId,
                Channel = channel,
                Message = caption ?? "",
                ImageUrl = imageUrl,
                SentAt = chat.SentAt
            };
        }

        // ===================== BUYER MỞ KHIẾU NẠI =====================

        public async Task<DisputeDetailDto> OpenDisputeAsync(
            int buyerId, int orderId, OpenDisputeRequest request)
        {
            // 1. Lấy Order
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            if (order.BuyerId != buyerId)
                throw new Exception("Bạn không có quyền khiếu nại đơn hàng này");

            if (order.Status != "shipped")
                throw new Exception($"Đơn hàng không ở trạng thái đã giao (status: {order.Status})");

            // 2. Kiểm tra thời hạn mở dispute (3 ngày)
            int windowDays = await _configRepo.GetIntAsync("dispute_window_days", 3);
            // Dùng UpdatedAt (thời điểm seller xác nhận giao) hoặc CreatedAt
            var shippedDate = order.UpdatedAt ?? order.CreatedAt;
            if (DateTime.UtcNow > shippedDate.AddDays(windowDays))
                throw new Exception($"Đã quá thời hạn {windowDays} ngày để mở khiếu nại");

            // 3. Kiểm tra chưa có dispute active
            var existingDispute = await _disputeRepo.GetDisputeByOrderIdAsync(orderId);
            if (existingDispute != null)
                throw new Exception("Đơn hàng này đã có khiếu nại đang xử lý");

            // 4. Upload ảnh/video lên Cloudinary
            var evidenceUrls = new List<string>();

            if (request.Images != null)
            {
                foreach (var file in request.Images)
                {
                    using var stream = file.OpenReadStream();
                    var upload = await _cloudinary.UploadAsync(new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = "disputes/images"
                    });
                    evidenceUrls.Add(upload.SecureUrl.ToString());
                }
            }

            if (request.Videos != null)
            {
                foreach (var file in request.Videos)
                {
                    using var stream = file.OpenReadStream();
                    var upload = await _cloudinary.UploadAsync(new VideoUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = "disputes/videos"
                    });
                    evidenceUrls.Add(upload.SecureUrl.ToString());
                }
            }

            // 5. Tạo Dispute
            var dispute = new Dispute
            {
                OrderId = orderId,
                OpenedByUserId = buyerId,
                Description = request.Description,
                EvidenceUrls = evidenceUrls.Count > 0
                    ? JsonSerializer.Serialize(evidenceUrls)
                    : null,
                Status = "open",
                CreatedAt = DateTime.UtcNow
            };

            int disputeId = await _disputeRepo.CreateDisputeAsync(dispute);

            // 5. Cập nhật Order → "disputed"
            await _orderRepo.UpdateOrderStatusAsync(orderId, "disputed");

            // 6. Trả về chi tiết
            return await GetDisputeDetailInternalAsync(disputeId);
        }

        // ===================== ADMIN/INSPECTOR XEM CHI TIẾT =====================

        public async Task<DisputeDetailDto?> GetDisputeDetailAsync(
            int disputeId, int requestUserId, string role)
        {
            var dispute = await _disputeRepo.GetDisputeByIdAsync(disputeId);
            if (dispute == null) return null;

            var dto = MapToDetailDto(dispute);

            // Admin/Inspector thấy cả 2 kênh chat
            if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase) ||
                role.Equals("Inspector", StringComparison.OrdinalIgnoreCase))
            {
                dto.BuyerChats = await GetChatsAsync(disputeId, "buyer");
                dto.SellerChats = await GetChatsAsync(disputeId, "seller");
            }
            // Buyer chỉ thấy kênh buyer
            else if (dispute.Order.BuyerId == requestUserId)
            {
                dto.BuyerChats = await GetChatsAsync(disputeId, "buyer");
            }
            // Seller chỉ thấy kênh seller
            else if (dispute.Order.SellerId == requestUserId)
            {
                dto.SellerChats = await GetChatsAsync(disputeId, "seller");
            }

            return dto;
        }

        // ===================== DANH SÁCH PENDING =====================

        public async Task<List<DisputeListDto>> GetPendingDisputesAsync()
        {
            var disputes = await _disputeRepo.GetAllPendingDisputesAsync();

            return disputes.Select(d => new DisputeListDto
            {
                DisputeId = d.DisputeId,
                OrderId = d.OrderId,
                Status = d.Status,
                Description = d.Description,
                OpenedByName = d.OpenedByUser?.FullName,
                BuyerName = d.Order?.Buyer?.FullName,
                SellerName = d.Order?.Seller?.FullName,
                OrderAmount = d.Order?.Amount ?? 0,
                CreatedAt = d.CreatedAt
            }).ToList();
        }

        // ===================== CHUYỂN SANG INVESTIGATING =====================

        public async Task InvestigateDisputeAsync(int disputeId, int staffId)
        {
            var dispute = await _disputeRepo.GetDisputeByIdAsync(disputeId);
            if (dispute == null)
                throw new Exception("Không tìm thấy khiếu nại");

            if (dispute.Status != "open")
                throw new Exception($"Khiếu nại không ở trạng thái mở (status: {dispute.Status})");

            dispute.Status = "investigating";
            await _disputeRepo.UpdateDisputeAsync(dispute);
        }

        // ===================== PHÁN QUYẾT =====================

        public async Task ResolveDisputeAsync(
            int disputeId, int staffId, ResolveDisputeRequest request)
        {
            var dispute = await _disputeRepo.GetDisputeByIdAsync(disputeId);
            if (dispute == null)
                throw new Exception("Không tìm thấy khiếu nại");

            if (dispute.Status != "open" && dispute.Status != "investigating")
                throw new Exception($"Khiếu nại đã được xử lý (status: {dispute.Status})");

            var validResolutions = new[] { "refund_full", "seller_win", "partial_refund" };
            if (!validResolutions.Contains(request.Resolution))
                throw new Exception("Resolution không hợp lệ. Phải là: refund_full, seller_win, partial_refund");

            var order = dispute.Order;
            decimal totalAmount = order.Amount;

            var systemWallet = await _walletRepo.GetSystemWalletAsync();

            switch (request.Resolution)
            {
                case "refund_full":
                    await HandleRefundFull(order, dispute, systemWallet, totalAmount);
                    break;

                case "seller_win":
                    await HandleSellerWin(order, dispute, systemWallet, totalAmount);
                    break;

                case "partial_refund":
                    if (request.RefundPercentage == null || request.RefundPercentage < 0 || request.RefundPercentage > 100)
                        throw new Exception("Vui lòng nhập RefundPercentage từ 0 đến 100");
                    await HandlePartialRefund(order, dispute, systemWallet, totalAmount, request.RefundPercentage.Value);
                    break;
            }

            // Cập nhật Dispute
            dispute.Status = $"resolved_{request.Resolution.Replace("_", "_")}";
            if (request.Resolution == "refund_full") dispute.Status = "resolved_refund";
            if (request.Resolution == "seller_win") dispute.Status = "resolved_seller_win";
            if (request.Resolution == "partial_refund") dispute.Status = "resolved_partial";

            dispute.Resolution = request.Resolution;
            dispute.AdminNote = request.AdminNote;
            dispute.ResolvedByUserId = staffId;
            dispute.ResolvedAt = DateTime.UtcNow;
            dispute.RefundAmount = dispute.RefundAmount; // đã set trong handle methods

            await _disputeRepo.UpdateDisputeAsync(dispute);
        }

        // ===================== XỬ LÝ HOÀN TIỀN 100% =====================

        private async Task HandleRefundFull(
            Order order, Dispute dispute, Wallet systemWallet, decimal totalAmount)
        {
            // 1. Order → "refunded"
            await _orderRepo.UpdateOrderStatusAsync(order.OrderId, "refunded");

            // 2. Vehicle → "active"
            var vehicleIds = await _orderRepo.GetVehicleIdsByOrderIdAsync(order.OrderId);
            foreach (var vid in vehicleIds)
                await _orderRepo.UpdateVehicleStatusAsync(vid, "active");

            // 3. Ví Tổng → Ví Buyer
            await _walletRepo.DeductBalanceAsync(systemWallet.WalletId, totalAmount);
            await _walletRepo.CreatePaymentTransactionAsync(
                systemWallet.WalletId, totalAmount,
                $"Hoàn tiền dispute đơn #{order.OrderId} cho buyer #{order.BuyerId}");

            Wallet buyerWallet = await _walletRepo.GetByUserIdAsync(order.BuyerId);
            if (buyerWallet != null)
            {
                await _walletRepo.AddBalanceAsync(buyerWallet.WalletId, totalAmount);
                await _walletRepo.CreatePaymentTransactionAsync(
                    buyerWallet.WalletId, totalAmount,
                    $"Hoàn tiền đơn hàng #{order.OrderId} — khiếu nại được chấp nhận", "success");
            }

            // 4. Ghi transaction cho seller (thông báo mất tiền)
            Wallet sellerWallet = await _walletRepo.GetByUserIdAsync(order.SellerId);
            if (sellerWallet != null)
            {
                await _walletRepo.CreatePaymentTransactionAsync(
                    sellerWallet.WalletId, totalAmount,
                    $"Mất tiền đơn #{order.OrderId} — khiếu nại buyer được chấp nhận", "failed");
            }

            dispute.RefundAmount = totalAmount;
        }

        // ===================== XỬ LÝ SELLER THẮNG =====================

        private async Task HandleSellerWin(
            Order order, Dispute dispute, Wallet systemWallet, decimal totalAmount)
        {
            // 1. Order → "completed" (giống xác nhận nhận hàng)
            await _orderRepo.UpdateOrderStatusAsync(order.OrderId, "completed");

            // 2. Vehicle → "sold"
            var vehicleIds = await _orderRepo.GetVehicleIdsByOrderIdAsync(order.OrderId);
            foreach (var vid in vehicleIds)
                await _orderRepo.UpdateVehicleStatusAsync(vid, "sold");

            // 3. Ví Tổng → Ví Seller
            await _walletRepo.DeductBalanceAsync(systemWallet.WalletId, totalAmount);
            await _walletRepo.CreatePaymentTransactionAsync(
                systemWallet.WalletId, totalAmount,
                $"Chuyển tiền đơn #{order.OrderId} cho seller #{order.SellerId} — dispute seller thắng");

            Wallet sellerWallet = await _walletRepo.GetByUserIdAsync(order.SellerId);
            if (sellerWallet != null)
            {
                await _walletRepo.AddBalanceAsync(sellerWallet.WalletId, totalAmount);
                await _walletRepo.CreatePaymentTransactionAsync(
                    sellerWallet.WalletId, totalAmount,
                    $"Nhận tiền đơn #{order.OrderId} — khiếu nại buyer bị bác", "success");
            }

            dispute.RefundAmount = 0;
        }

        // ===================== XỬ LÝ HOÀN 1 PHẦN =====================

        private async Task HandlePartialRefund(
            Order order, Dispute dispute, Wallet systemWallet,
            decimal totalAmount, decimal refundPercentage)
        {
            decimal buyerRefund = Math.Round(totalAmount * refundPercentage / 100, 0);
            decimal sellerShare = totalAmount - buyerRefund;

            // 1. Order → "partially_refunded"
            await _orderRepo.UpdateOrderStatusAsync(order.OrderId, "partially_refunded");

            // 2. Vehicle → "active"
            var vehicleIds = await _orderRepo.GetVehicleIdsByOrderIdAsync(order.OrderId);
            foreach (var vid in vehicleIds)
                await _orderRepo.UpdateVehicleStatusAsync(vid, "active");

            // 3. Ví Tổng → Ví Buyer (phần hoàn)
            if (buyerRefund > 0)
            {
                await _walletRepo.DeductBalanceAsync(systemWallet.WalletId, buyerRefund);
                await _walletRepo.CreatePaymentTransactionAsync(
                    systemWallet.WalletId, buyerRefund,
                    $"Hoàn {refundPercentage}% đơn #{order.OrderId} cho buyer #{order.BuyerId}");

                Wallet buyerWallet = await _walletRepo.GetByUserIdAsync(order.BuyerId);
                if (buyerWallet != null)
                {
                    await _walletRepo.AddBalanceAsync(buyerWallet.WalletId, buyerRefund);
                    await _walletRepo.CreatePaymentTransactionAsync(
                        buyerWallet.WalletId, buyerRefund,
                        $"Hoàn {refundPercentage}% đơn #{order.OrderId} — dispute giải quyết", "success");
                }
            }

            // 4. Ví Tổng → Ví Seller (phần còn lại)
            if (sellerShare > 0)
            {
                await _walletRepo.DeductBalanceAsync(systemWallet.WalletId, sellerShare);
                await _walletRepo.CreatePaymentTransactionAsync(
                    systemWallet.WalletId, sellerShare,
                    $"Chuyển {100 - refundPercentage}% đơn #{order.OrderId} cho seller #{order.SellerId}");

                Wallet sellerWallet = await _walletRepo.GetByUserIdAsync(order.SellerId);
                if (sellerWallet != null)
                {
                    await _walletRepo.AddBalanceAsync(sellerWallet.WalletId, sellerShare);
                    await _walletRepo.CreatePaymentTransactionAsync(
                        sellerWallet.WalletId, sellerShare,
                        $"Nhận {100 - refundPercentage}% đơn #{order.OrderId} — dispute giải quyết", "success");
                }
            }

            dispute.RefundAmount = buyerRefund;
        }

        // ===================== SELLER PHẢN HỒI =====================

        public async Task SellerRespondAsync(int orderId, int sellerId, string response)
        {
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            if (order.SellerId != sellerId)
                throw new Exception("Bạn không có quyền phản hồi đơn hàng này");

            var dispute = await _disputeRepo.GetDisputeByOrderIdAsync(orderId);
            if (dispute == null)
                throw new Exception("Đơn hàng này chưa có khiếu nại");

            dispute.SellerResponse = response;
            await _disputeRepo.UpdateDisputeAsync(dispute);
        }

        // ===================== LẤY DISPUTE THEO ORDER =====================

        public async Task<DisputeDetailDto?> GetDisputeByOrderIdAsync(int orderId)
        {
            var dispute = await _disputeRepo.GetDisputeByOrderIdAsync(orderId);
            if (dispute == null) return null;

            return MapToDetailDto(dispute);
        }

        // ===================== LỊCH SỬ CHAT =====================

        public async Task<List<DisputeChatDto>> GetChatsAsync(int disputeId, string channel)
        {
            var chats = await _disputeRepo.GetChatsByDisputeIdAndChannelAsync(disputeId, channel);

            return chats.Select(c => new DisputeChatDto
            {
                DisputeChatId = c.DisputeChatId,
                SenderId = c.SenderId,
                SenderName = c.Sender?.FullName,
                SenderAvatar = c.Sender?.AvatarUrl,
                Channel = c.Channel,
                Message = c.Message,
                ImageUrl = c.ImageUrl,
                SentAt = c.SentAt
            }).ToList();
        }

        // ===================== HELPER =====================

        private async Task<DisputeDetailDto> GetDisputeDetailInternalAsync(int disputeId)
        {
            var dispute = await _disputeRepo.GetDisputeByIdAsync(disputeId);
            return MapToDetailDto(dispute!);
        }

        private DisputeDetailDto MapToDetailDto(Dispute dispute)
        {
            var order = dispute.Order;

            return new DisputeDetailDto
            {
                DisputeId = dispute.DisputeId,
                OrderId = dispute.OrderId,
                Status = dispute.Status,
                Description = dispute.Description,
                EvidenceUrls = dispute.EvidenceUrls,
                SellerResponse = dispute.SellerResponse,
                AdminNote = dispute.AdminNote,
                Resolution = dispute.Resolution,
                RefundAmount = dispute.RefundAmount,
                OpenedByName = dispute.OpenedByUser?.FullName,
                ResolvedByName = dispute.ResolvedByUser?.FullName,
                CreatedAt = dispute.CreatedAt,
                ResolvedAt = dispute.ResolvedAt,
                OrderAmount = order.Amount,
                BuyerName = order.Buyer?.FullName,
                BuyerPhone = order.Buyer?.Phone,
                BuyerEmail = order.Buyer?.Email,
                SellerName = order.Seller?.FullName,
                SellerPhone = order.Seller?.Phone,
                SellerEmail = order.Seller?.Email,
                Vehicles = order.OrderDetails?.Select(od => new DisputeVehicleDto
                {
                    VehicleId = od.VehicleId,
                    VehicleName = od.Vehicle?.Name,
                    Price = od.Price,
                    IsInspected = od.Vehicle?.IsInspected,
                    InspectionResult = od.Vehicle?.InspectionReports?.FirstOrDefault()?.Result,
                    InspectorId = od.Vehicle?.InspectionReports?.FirstOrDefault()?.InspectorId
                }).ToList() ?? new List<DisputeVehicleDto>()
            };
        }
    }
}
