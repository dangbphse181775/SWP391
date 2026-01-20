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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Phone) ||
                string.IsNullOrWhiteSpace(req.Password))
            {
                return BadRequest(new { message = "Thiếu dữ liệu" });
            }

            await using var conn = await _dataSource.OpenConnectionAsync();

            int userId;
            string fullName;
            string passwordHash;
            string roleName;

            // 1. Lấy user theo phone
            await using (var cmd = new NpgsqlCommand(@"
        SELECT u.user_id, u.full_name, u.password_hash, r.role_name
        FROM users u
        JOIN role r ON u.role_id = r.role_id
        WHERE u.phone = @phone
    ", conn))
            {
                cmd.Parameters.AddWithValue("phone", req.Phone);

                await using var reader = await cmd.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    return Unauthorized(new { message = "Số điện thoại hoặc mật khẩu không đúng" });
                }

                userId = reader.GetInt32(0);
                fullName = reader.GetString(1);
                passwordHash = reader.GetString(2);
                roleName = reader.GetString(3);
            }

            // 2. So sánh mật khẩu
            bool ok = BCrypt.Net.BCrypt.Verify(req.Password, passwordHash);
            if (!ok)
            {
                return Unauthorized(new { message = "Số điện thoại hoặc mật khẩu không đúng" });
            }

            // 3. Thành công
            return Ok(new
            {
                message = "Đăng nhập thành công",
                userId,
                fullName,
                phone = req.Phone,
                role = roleName
            });
        }
    }
}
