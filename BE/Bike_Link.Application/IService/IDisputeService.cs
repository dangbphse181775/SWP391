using Bike_Link.Application.DTO;

namespace Bike_Link.Application.IService
{
    public interface IDisputeService
    {
        /// <summary>
        /// Buyer mở khiếu nại cho order đang ở trạng thái "shipped"
        /// </summary>
        Task<DisputeDetailDto> OpenDisputeAsync(int buyerId, int orderId, OpenDisputeRequest request);

        /// <summary>
        /// Lấy chi tiết dispute (kèm thông tin order, buyer, seller, chats)
        /// </summary>
        Task<DisputeDetailDto?> GetDisputeDetailAsync(int disputeId, int requestUserId, string role);

        /// <summary>
        /// Lấy danh sách disputes đang chờ xử lý cho Admin/Inspector
        /// </summary>
        Task<List<DisputeListDto>> GetPendingDisputesAsync();

        /// <summary>
        /// Admin/Inspector chuyển dispute sang trạng thái "investigating"
        /// </summary>
        Task InvestigateDisputeAsync(int disputeId, int staffId);

        /// <summary>
        /// Admin/Inspector phán quyết dispute
        /// </summary>
        Task ResolveDisputeAsync(int disputeId, int staffId, ResolveDisputeRequest request);

        /// <summary>
        /// Seller phản hồi / giải trình
        /// </summary>
        Task SellerRespondAsync(int orderId, int sellerId, string response);

        /// <summary>
        /// Lấy dispute theo orderId
        /// </summary>
        Task<DisputeDetailDto?> GetDisputeByOrderIdAsync(int orderId);

        /// <summary>
        /// Lấy lịch sử chat theo channel
        /// </summary>
        Task<List<DisputeChatDto>> GetChatsAsync(int disputeId, string channel);
    }
}
