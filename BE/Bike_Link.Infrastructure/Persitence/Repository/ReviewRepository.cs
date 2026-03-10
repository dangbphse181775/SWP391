using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Bike_Link.Infrastructure.Persitence.Repository;

public class ReviewRepository : IReviewRepository
{
    private readonly BikeLinkContext _context;

    public ReviewRepository(BikeLinkContext context)
    {
        _context = context;
    }

    // Lấy review theo ID
    public async Task<Review> GetByIdAsync(int reviewId)
    {
        return await _context.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.TargetUser)
            .Include(r => r.Order)
            .FirstOrDefaultAsync(r => r.ReviewId == reviewId);
    }

    // Lấy review theo OrderId (mỗi order chỉ có 1 review)
    public async Task<Review> GetByOrderIdAsync(int orderId)
    {
        return await _context.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.TargetUser)
            .FirstOrDefaultAsync(r => r.OrderId == orderId);
    }

    // Lấy tất cả review mà user đã viết
    public async Task<List<Review>> GetByReviewerIdAsync(int reviewerId)
    {
        return await _context.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.TargetUser)
            .Include(r => r.Order)
            .Where(r => r.ReviewerId == reviewerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Review>> GetByTargetUserIdAsync(int targetUserId)
    {
        return await _context.Reviews
            .Include(r => r.Reviewer)        
            .Include(r => r.TargetUser)
            .Include(r => r.Order)
            .Where(r => r.TargetUserId == targetUserId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    // Lấy tất cả review
    public async Task<List<Review>> GetAllAsync()
    {
        return await _context.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.TargetUser)
            .Include(r => r.Order)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    // Lấy order theo orderId để hiển thị thông tin người mua và người bán trong review
    public async Task<Order> GetOrderAsync(int orderId)
    {
        return await _context.Orders
            .Include(o => o.Buyer)
            .Include(o => o.Seller)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);
    }

    // Tạo review mới
    public async Task CreateAsync(Review review)
    {
        review.CreatedAt = DateTime.UtcNow;
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
    }

    // Cập nhật review (chỉ có thể cập nhật rating và comment)
    public async Task UpdateAsync(Review review)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync();
    }

    // Xóa review theo ID
    public async Task DeleteAsync(int reviewId)
    {
        Review review = await _context.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId);
        if (review != null)
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }

    // Xóa review theo OrderId (mỗi order chỉ có 1 review)
    public async Task DeleteByOrderIdAsync(int orderId)
    {
        Review review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.OrderId == orderId);

        if (review != null)
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }

    // Kiểm tra xem order đã có review chưa (1 order chỉ có 1 review)
    public async Task<bool> ExistsByOrderIdAsync(int orderId)
    {
        return await _context.Reviews
            .AnyAsync(r => r.OrderId == orderId);
    }
}