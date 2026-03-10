using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository;

public interface IReviewRepository
{
    Task<Review> GetByIdAsync(int reviewId);
    Task<Review> GetByOrderIdAsync(int orderId);
    Task<List<Review>> GetByReviewerIdAsync(int reviewerId);
    Task<List<Review>> GetByTargetUserIdAsync(int targetUserId);
    Task<List<Review>> GetAllAsync();
    Task<Order?> GetOrderAsync(int orderId);
    Task CreateAsync(Review review);
    Task UpdateAsync(Review review);
    Task DeleteAsync(int reviewId);
    Task DeleteByOrderIdAsync(int orderId);
    Task<bool> ExistsByOrderIdAsync(int orderId);
}