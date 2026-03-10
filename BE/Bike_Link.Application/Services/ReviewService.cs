using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;

namespace Bike_Link.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepo;

    public ReviewService(IReviewRepository reviewRepo)
    {
        _reviewRepo = reviewRepo;
    }

    // Lấy review theo reviewId
    public async Task<ReviewDto> GetByIdAsync(int reviewId)
    {
        Review review = await _reviewRepo.GetByIdAsync(reviewId);

        if (review == null)
            return null;

        return new ReviewDto
        {
            ReviewId = review.ReviewId,
            OrderId = review.OrderId,
            ReviewerName = review.Reviewer.FullName,
            TargetUserName = review.TargetUser.FullName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    // Lấy review của một đơn hàng (chỉ có 1 review)
    public async Task<ReviewDto?> GetByOrderIdAsync(int orderId)
    {
        Review review = await _reviewRepo.GetByOrderIdAsync(orderId);

        if (review == null)
            return null;

        return new ReviewDto
        {
            ReviewId = review.ReviewId,
            OrderId = review.OrderId,
            ReviewerName = review.Reviewer.FullName,
            TargetUserName = review.TargetUser.FullName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    // Lấy tất cả review mà một user đã viết
    public async Task<List<ReviewDto>> GetByReviewerIdAsync(int reviewerId)
    {
        List<Review> reviews = await _reviewRepo.GetByReviewerIdAsync(reviewerId);
        
        return reviews.Select(review => new ReviewDto
        {
            ReviewId = review.ReviewId,
            OrderId = review.OrderId,
            ReviewerName = review.Reviewer.FullName,
            TargetUserName = review.TargetUser.FullName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        }).ToList();
    }

    // Lấy tất cả review mà một user nhận được
    public async Task<List<ReviewDto>> GetByTargetUserIdAsync(int targetUserId)
    {
        List<Review> reviews = await _reviewRepo.GetByTargetUserIdAsync(targetUserId);
        
        return reviews.Select(review => new ReviewDto
        {
            ReviewId = review.ReviewId,
            OrderId = review.OrderId,
            ReviewerName = review.Reviewer.FullName,
            TargetUserName = review.TargetUser.FullName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        }).ToList();
    }

    // Lấy tất cả review
    public async Task<List<ReviewDto>> GetAllAsync()
    {
        List<Review> reviews = await _reviewRepo.GetAllAsync();
        
        return reviews.Select(review => new ReviewDto
        {
            ReviewId = review.ReviewId,
            OrderId = review.OrderId,
            ReviewerName = review.Reviewer.FullName,
            TargetUserName = review.TargetUser.FullName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        }).ToList();
    }

    // Tạo review mới
    public async Task<int> CreateAsync(int userId, CreateReviewRequest request)
    {
        // Lấy thông tin Order để xác định Buyer và Seller
        Order order = await _reviewRepo.GetOrderAsync(request.OrderId);
        
        if (order == null)
            throw new Exception("Không tìm thấy đơn hàng");

        // Kiểm tra user có phải là Buyer của order không
        if (order.BuyerId != userId)
            throw new UnauthorizedAccessException("Chỉ người mua mới có thể đánh giá đơn hàng này");

        // Validate rating (1-5)
        if (request.Rating < 1 || request.Rating > 5)
            throw new ArgumentException("Đánh giá phải từ 1 đến 5 sao");

        // Kiểm tra xem order đã có review chưa (1 order chỉ có 1 review)
        bool exists = await _reviewRepo.ExistsByOrderIdAsync(request.OrderId);
        if (exists)
            throw new Exception("Bạn đã đánh giá đơn hàng này rồi");

        // Tự động gán ReviewerId = BuyerId và TargetUserId = SellerId
        Review review = new Review
        {
            OrderId = request.OrderId,
            ReviewerId = order.BuyerId,    // Người mua là reviewer
            TargetUserId = order.SellerId,  // Người bán là target
            Rating = request.Rating,
            Comment = request.Comment?.Trim()
        };

        await _reviewRepo.CreateAsync(review);

        return review.ReviewId;
    }

    // Cập nhật review theo reviewId
    public async Task UpdateAsync(int reviewId, int userId, UpdateReviewRequest request)
    {
        Review review = await _reviewRepo.GetByIdAsync(reviewId);

        if (review == null)
            throw new Exception("Không tìm thấy đánh giá");

        // Chỉ cho phép người mua (reviewer) mới được sửa
        if (review.ReviewerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền sửa đánh giá này");

        // Validate rating (1-5)
        if (request.Rating < 1 || request.Rating > 5)
            throw new ArgumentException("Đánh giá phải từ 1 đến 5 sao");

        review.Rating = request.Rating;
        review.Comment = request.Comment?.Trim();

        await _reviewRepo.UpdateAsync(review);
    }

    // Cập nhật review theo orderId
    public async Task UpdateByOrderIdAsync(int orderId, int userId, UpdateReviewRequest request)
    {
        Review review = await _reviewRepo.GetByOrderIdAsync(orderId);

        if (review == null)
            throw new Exception("Không tìm thấy đánh giá");

        // Chỉ cho phép người mua (reviewer) mới được sửa
        if (review.ReviewerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền sửa đánh giá này");

        // Validate rating (1-5)
        if (request.Rating < 1 || request.Rating > 5)
            throw new ArgumentException("Đánh giá phải từ 1 đến 5 sao");

        review.Rating = request.Rating;
        review.Comment = request.Comment?.Trim();

        await _reviewRepo.UpdateAsync(review);
    }

    // Xóa review theo reviewId
    public async Task DeleteAsync(int reviewId, int userId)
    {
        Review review = await _reviewRepo.GetByIdAsync(reviewId);

        if (review == null)
            throw new Exception("Không tìm thấy đánh giá");

        // Chỉ cho phép người mua (reviewer) mới được xóa
        if (review.ReviewerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa đánh giá này");

        await _reviewRepo.DeleteAsync(reviewId);
    }

    // Xóa review theo orderId
    public async Task DeleteByOrderIdAsync(int orderId, int userId)
    {
        Review review = await _reviewRepo.GetByOrderIdAsync(orderId);

        if (review == null)
            throw new Exception("Không tìm thấy đánh giá nào cho đơn hàng này");

        // Chỉ cho phép người mua (reviewer) mới được xóa
        if (review.ReviewerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa đánh giá này");

        await _reviewRepo.DeleteByOrderIdAsync(orderId);
    }
}