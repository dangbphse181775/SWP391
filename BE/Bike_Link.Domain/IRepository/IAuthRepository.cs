using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Domain.IRepository
{
    public interface IAuthRepository
    {
        Task<bool> EmailExistsAsync(string email);

        Task<int> GetRoleIdAsync(string roleName);

        Task<int> InsertUserAsync(string email, string fullName, string passwordHash, int roleId);

        Task<AuthUser?> GetByEmailAsync(string email);
    }

    
    public class AuthUser
    {
        public int UserId { get; set; }
        public string Email { get; set; } = null!;
        public string? FullName { get; set; }
        public string PasswordHash { get; set; } = null!;
        public string RoleName { get; set; } = null!;
    }
}
