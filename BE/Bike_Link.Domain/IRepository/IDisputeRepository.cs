using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository
{
    public interface IDisputeRepository
    {
        Task<int> CreateDisputeAsync(Dispute dispute);
        Task<Dispute?> GetDisputeByIdAsync(int disputeId);
        Task<Dispute?> GetDisputeByOrderIdAsync(int orderId);
        Task<List<Dispute>> GetDisputesByStatusAsync(string status);
        Task<List<Dispute>> GetAllPendingDisputesAsync();
        Task UpdateDisputeAsync(Dispute dispute);

        // Chat
        Task<int> AddChatMessageAsync(DisputeChat chat);
        Task<List<DisputeChat>> GetChatsByDisputeIdAndChannelAsync(int disputeId, string channel);
    }
}
