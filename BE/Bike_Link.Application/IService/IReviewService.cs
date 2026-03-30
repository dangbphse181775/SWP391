using Bike_Link.Application.DTO;

namespace Bike_Link.Application.IService;

public interface IReviewService
{
    Task<ReviewDto> GetByIdAsync(int reviewId);
    Task<ReviewDto> GetByOrderIdAsync(int orderId);
    Task<List<ReviewDto>> GetByReviewerIdAsync(int reviewerId);
    Task<List<ReviewDto>> GetByTargetUserIdAsync(int targetUserId);
    Task<List<ReviewDto>> GetAllAsync();
    Task<int> CreateAsync(int reviewerId, CreateReviewRequest request);
    Task UpdateAsync(int reviewId, int reviewerId, UpdateReviewRequest request);
    Task UpdateByOrderIdAsync(int orderId, int reviewerId, UpdateReviewRequest request);
    Task DeleteAsync(int reviewId, int reviewerId);
    Task DeleteByOrderIdAsync(int orderId, int userId);
}