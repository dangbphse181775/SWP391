using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly BikeLinkContext _context;

        public ProfileRepository(BikeLinkContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            // Sử dụng Entity Framework để truy vấn người dùng theo userId, bao gồm thông tin Role
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }

        // Lấy tất cả người dùng, sắp xếp theo userID
        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .OrderByDescending(u => u.UserId)
                .ToListAsync();
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            // Cập nhật thời gian Update Profile
            user.UpdatedAt = DateTime.UtcNow;
            //Update User bằng Entity Framework
            _context.Users.Update(user);
            // Lưu thay đổi vào cơ sở dữ liệu
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateAvatarAsync(int userId, string avatarUrl)
        {
            // Tìm người dùng theo userId
            User user = await _context.Users.FindAsync(userId);
            if (user == null) return false; // Nếu không tìm thấy người dùng, trả về false
            // Cập nhật URL avatar và thời gian cập nhật
            user.AvatarUrl = avatarUrl;
            user.UpdatedAt = DateTime.UtcNow;
            // Lưu thay đổi vào cơ sở dữ liệu
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateStatusAsync(int userId, string status)
        {
            // Tìm người dùng theo userId
            User user = await _context.Users.FindAsync(userId);
            if (user == null) return false; // Nếu không tìm thấy người dùng, trả về false
            // Cập nhật status và thời gian cập nhật
            user.Status = status;
            user.UpdatedAt = DateTime.UtcNow;
            // Lưu thay đổi vào cơ sở dữ liệu
            return await _context.SaveChangesAsync() > 0;
        }
    }
}