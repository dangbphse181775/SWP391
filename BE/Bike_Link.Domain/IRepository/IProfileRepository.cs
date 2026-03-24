using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository
{
    public interface IProfileRepository
    {
        Task<User?> GetUserByIdAsync(int userId);
        Task<bool> UpdateUserAsync(User user);
        Task<bool> UpdateAvatarAsync(int userId, string avatarUrl);
        Task<List<User>> GetAllUsersAsync();
        Task<bool> UpdateStatusAsync(int userId, string status);
        
    }
}