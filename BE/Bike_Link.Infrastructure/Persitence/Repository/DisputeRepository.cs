using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class DisputeRepository : IDisputeRepository
    {
        private readonly BikeLinkContext _context;

        public DisputeRepository(BikeLinkContext context)
        {
            _context = context;
        }

        public async Task<int> CreateDisputeAsync(Dispute dispute)
        {
            _context.Disputes.Add(dispute);
            await _context.SaveChangesAsync();
            return dispute.DisputeId;
        }

        public async Task<Dispute?> GetDisputeByIdAsync(int disputeId)
        {
            return await _context.Disputes
                .Include(d => d.Order)
                    .ThenInclude(o => o.Buyer)
                .Include(d => d.Order)
                    .ThenInclude(o => o.Seller)
                .Include(d => d.Order)
                    .ThenInclude(o => o.OrderDetails)
                        .ThenInclude(od => od.Vehicle)
                            .ThenInclude(v => v.InspectionReports)
                .Include(d => d.OpenedByUser)
                .Include(d => d.ResolvedByUser)
                .Include(d => d.DisputeChats)
                    .ThenInclude(c => c.Sender)
                .FirstOrDefaultAsync(d => d.DisputeId == disputeId);
        }

        public async Task<Dispute?> GetDisputeByOrderIdAsync(int orderId)
        {
            return await _context.Disputes
                .Include(d => d.Order)
                    .ThenInclude(o => o.Buyer)
                .Include(d => d.Order)
                    .ThenInclude(o => o.Seller)
                .Include(d => d.OpenedByUser)
                .FirstOrDefaultAsync(d => d.OrderId == orderId
                    && d.Status != "resolved_refund"
                    && d.Status != "resolved_seller_win"
                    && d.Status != "resolved_partial");
        }

        public async Task<List<Dispute>> GetDisputesByStatusAsync(string status)
        {
            return await _context.Disputes
                .Include(d => d.Order)
                    .ThenInclude(o => o.Buyer)
                .Include(d => d.Order)
                    .ThenInclude(o => o.Seller)
                .Include(d => d.OpenedByUser)
                .Where(d => d.Status == status)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Dispute>> GetAllPendingDisputesAsync()
        {
            return await _context.Disputes
                .Include(d => d.Order)
                    .ThenInclude(o => o.Buyer)
                .Include(d => d.Order)
                    .ThenInclude(o => o.Seller)
                .Include(d => d.OpenedByUser)
                .Where(d => d.Status == "open" || d.Status == "investigating")
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task UpdateDisputeAsync(Dispute dispute)
        {
            _context.Disputes.Update(dispute);
            await _context.SaveChangesAsync();
        }

        // ===================== CHAT =====================

        public async Task<int> AddChatMessageAsync(DisputeChat chat)
        {
            _context.DisputeChats.Add(chat);
            await _context.SaveChangesAsync();
            return chat.DisputeChatId;
        }

        public async Task<List<DisputeChat>> GetChatsByDisputeIdAndChannelAsync(
            int disputeId, string channel)
        {
            return await _context.DisputeChats
                .Include(c => c.Sender)
                .Where(c => c.DisputeId == disputeId && c.Channel == channel)
                .OrderBy(c => c.SentAt)
                .ToListAsync();
        }
    }
}
