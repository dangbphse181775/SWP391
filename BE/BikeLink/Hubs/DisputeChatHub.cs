using Bike_Link.Application.DTO;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace BikeLink.Hubs
{
    [Authorize]
    public class DisputeChatHub : Hub
    {
        private readonly IDisputeRepository _disputeRepo;
        private readonly IOrderRepository _orderRepo;

        public DisputeChatHub(
            IDisputeRepository disputeRepo,
            IOrderRepository orderRepo)
        {
            _disputeRepo = disputeRepo;
            _orderRepo = orderRepo;
        }

        /// <summary>
        /// Tham gia kênh chat. Buyer chỉ join "buyer", Seller chỉ join "seller".
        /// Admin/Inspector join được cả hai.
        /// </summary>
        public async Task JoinDisputeChannel(int disputeId, string channel)
        {
            var userId = GetUserId();
            var role = GetRole();

            var dispute = await _disputeRepo.GetDisputeByIdAsync(disputeId);
            if (dispute == null)
                throw new HubException("Không tìm thấy khiếu nại");

            // Kiểm tra quyền tham gia channel
            ValidateChannelAccess(dispute, userId, role, channel);

            var groupName = $"dispute_{disputeId}_{channel}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            await Clients.Group(groupName).SendAsync("UserJoined", new
            {
                userId,
                channel,
                message = $"User đã tham gia kênh {channel}"
            });
        }

        /// <summary>
        /// Gửi tin nhắn text vào kênh
        /// </summary>
        public async Task SendMessage(int disputeId, string channel, string message)
        {
            var userId = GetUserId();
            var role = GetRole();

            var dispute = await _disputeRepo.GetDisputeByIdAsync(disputeId);
            if (dispute == null)
                throw new HubException("Không tìm thấy khiếu nại");

            ValidateChannelAccess(dispute, userId, role, channel);

            // Lưu vào DB
            var chat = new DisputeChat
            {
                DisputeId = disputeId,
                SenderId = userId,
                Channel = channel,
                Message = message,
                SentAt = DateTime.UtcNow
            };

            await _disputeRepo.AddChatMessageAsync(chat);

            // Broadcast cho group
            var groupName = $"dispute_{disputeId}_{channel}";
            await Clients.Group(groupName).SendAsync("ReceiveMessage", new DisputeChatDto
            {
                DisputeChatId = chat.DisputeChatId,
                SenderId = userId,
                SenderName = Context.User?.FindFirst("FullName")?.Value ?? $"User #{userId}",
                Channel = channel,
                Message = message,
                ImageUrl = null,
                SentAt = chat.SentAt
            });
        }

        /// <summary>
        /// Gửi tin nhắn kèm ảnh (ImageUrl đã upload lên Cloudinary từ trước qua REST API)
        /// </summary>
        public async Task SendImage(int disputeId, string channel, string imageUrl, string? caption)
        {
            var userId = GetUserId();
            var role = GetRole();

            var dispute = await _disputeRepo.GetDisputeByIdAsync(disputeId);
            if (dispute == null)
                throw new HubException("Không tìm thấy khiếu nại");

            ValidateChannelAccess(dispute, userId, role, channel);

            var chat = new DisputeChat
            {
                DisputeId = disputeId,
                SenderId = userId,
                Channel = channel,
                Message = caption ?? "",
                ImageUrl = imageUrl,
                SentAt = DateTime.UtcNow
            };

            await _disputeRepo.AddChatMessageAsync(chat);

            var groupName = $"dispute_{disputeId}_{channel}";
            await Clients.Group(groupName).SendAsync("ReceiveMessage", new DisputeChatDto
            {
                DisputeChatId = chat.DisputeChatId,
                SenderId = userId,
                SenderName = Context.User?.FindFirst("FullName")?.Value ?? $"User #{userId}",
                Channel = channel,
                Message = caption ?? "",
                ImageUrl = imageUrl,
                SentAt = chat.SentAt
            });
        }

        /// <summary>
        /// Rời kênh chat
        /// </summary>
        public async Task LeaveDisputeChannel(int disputeId, string channel)
        {
            var groupName = $"dispute_{disputeId}_{channel}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        // ===================== HELPER =====================

        private void ValidateChannelAccess(Dispute dispute, int userId, string role, string channel)
        {
            if (channel != "buyer" && channel != "seller")
                throw new HubException("Channel không hợp lệ. Phải là 'buyer' hoặc 'seller'");

            // Admin và Inspector được vào cả 2 kênh
            if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase) ||
                role.Equals("Inspector", StringComparison.OrdinalIgnoreCase))
                return;

            // Buyer chỉ vào kênh buyer
            if (dispute.Order.BuyerId == userId && channel == "buyer")
                return;

            // Seller chỉ vào kênh seller
            if (dispute.Order.SellerId == userId && channel == "seller")
                return;

            throw new HubException("Bạn không có quyền tham gia kênh chat này");
        }

        private int GetUserId()
        {
            var claim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)
                     ?? Context.User?.FindFirst("UserId");
            if (claim == null)
                throw new HubException("Không xác định được người dùng");
            return int.Parse(claim.Value);
        }

        private string GetRole()
        {
            return Context.User?.FindFirst(ClaimTypes.Role)?.Value
                ?? Context.User?.FindFirst("Role")?.Value
                ?? "";
        }
    }
}
