using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.IRepository;
using Npgsql;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class AuthRepository : IAuthRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public AuthRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
SELECT 1 FROM ""Users"" WHERE ""Email"" = @email LIMIT 1
", conn);

            cmd.Parameters.AddWithValue("email", email);
            var rs = await cmd.ExecuteScalarAsync();
            return rs != null;
        }

        public async Task<int> GetRoleIdAsync(string roleName)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
SELECT ""RoleId"" FROM ""Roles"" WHERE ""RoleName"" = @name
", conn);

            cmd.Parameters.AddWithValue("name", roleName);
            var rs = await cmd.ExecuteScalarAsync();

            if (rs == null)
                throw new InvalidOperationException($"Role '{roleName}' chưa tồn tại");

            return (int)rs;
        }

        public async Task<int> InsertUserAsync(string email, string fullName, string passwordHash, int roleId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
INSERT INTO ""Users"" (""Email"", ""FullName"", ""PasswordHash"", ""RoleId"", ""CreatedAt"")
VALUES (@email, @name, @hash, @role, NOW())
RETURNING ""UserId"";
", conn);

            cmd.Parameters.AddWithValue("email", email);
            cmd.Parameters.AddWithValue("name", fullName);
            cmd.Parameters.AddWithValue("hash", passwordHash);
            cmd.Parameters.AddWithValue("role", roleId);

            return (int)(await cmd.ExecuteScalarAsync())!;
        }

        public async Task<AuthUser?> GetByEmailAsync(string email)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
SELECT 
    u.""UserId"", 
    u.""Email"", 
    u.""FullName"", 
    u.""PasswordHash"", 
    r.""RoleName""
FROM ""Users"" u
JOIN ""Roles"" r ON u.""RoleId"" = r.""RoleId""
WHERE u.""Email"" = @email
", conn);

            cmd.Parameters.AddWithValue("email", email);

            await using var rd = await cmd.ExecuteReaderAsync();
            if (!await rd.ReadAsync()) return null;

            return new AuthUser
            {
                UserId = rd.GetInt32(0),
                Email = rd.GetString(1),
                FullName = rd.IsDBNull(2) ? null : rd.GetString(2),
                PasswordHash = rd.GetString(3),
                RoleName = rd.GetString(4)
            };
        }
    }
}

