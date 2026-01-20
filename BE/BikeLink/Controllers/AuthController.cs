using Bike_Link.Application.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly NpgsqlDataSource _dataSource;

        public AuthController(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Phone) ||
                string.IsNullOrWhiteSpace(req.FullName) ||
                string.IsNullOrWhiteSpace(req.Password))
            {
                return BadRequest(new { message = "Thiếu dữ liệu" });
            }

            await using var conn = await _dataSource.OpenConnectionAsync();

            // 1. Lấy role_id của buyer
            int buyerRoleId;
            await using (var cmd = new NpgsqlCommand(
                "SELECT role_id FROM role WHERE role_name = 'buyer'", conn))
            {
                var result = await cmd.ExecuteScalarAsync();
                if (result == null)
                    return StatusCode(500, new { message = "Chưa có role buyer trong DB" });

                buyerRoleId = (int)result;
            }

            // 2. Kiểm tra trùng SĐT
            await using (var cmd = new NpgsqlCommand(
                "SELECT 1 FROM users WHERE phone = @phone", conn))
            {
                cmd.Parameters.AddWithValue("phone", req.Phone);
                var exist = await cmd.ExecuteScalarAsync();
                if (exist != null)
                    return Conflict(new { message = "SĐT đã tồn tại" });
            }

            // 3. Hash mật khẩu
            var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);

            // 4. Insert user
            int userId;
            await using (var cmd = new NpgsqlCommand(@"
            INSERT INTO users (phone, full_name, password_hash, role_id)
            VALUES (@phone, @name, @hash, @roleId)
            RETURNING user_id;
        ", conn))
            {
                cmd.Parameters.AddWithValue("phone", req.Phone);
                cmd.Parameters.AddWithValue("name", req.FullName);
                cmd.Parameters.AddWithValue("hash", hash);
                cmd.Parameters.AddWithValue("roleId", buyerRoleId);

                userId = (int)(await cmd.ExecuteScalarAsync())!;
            }

            // 5. Tạo buyer profile
            await using (var cmd = new NpgsqlCommand(
                "INSERT INTO buyers (user_id) VALUES (@uid)", conn))
            {
                cmd.Parameters.AddWithValue("uid", userId);
                await cmd.ExecuteNonQueryAsync();
            }

            return Ok(new
            {
                message = "Đăng ký thành công",
                userId,
                phone = req.Phone,
                fullName = req.FullName,
                role = "buyer"
            });
        }
    }
}
