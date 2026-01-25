using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using BikeLink.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service;
        private readonly IConfiguration _config;

        public UsersController(IUserService service, IConfiguration config)
        {
            _service = service;
            _config = config;
        }

        [Authorize]
        [HttpPost("upgrade-to-seller")]
        public async Task<IActionResult> UpgradeToSeller([FromBody] UpgradeToSellerRequest req)
        {
            try
            {
                int userId = User.GetUserId();
                string fullName = User.Identity?.Name ?? "";

                // Nâng cấp trong DB
                await _service.UpgradeToSellerAsync(userId, req);

                // Tạo JWT mới với role = seller
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                    new Claim(ClaimTypes.Role, "seller"),
                    new Claim(ClaimTypes.Name, fullName)
                };

                var key = _config["Jwt:Key"];
                var expireDays = int.Parse(_config["Jwt:ExpireDays"] ?? "7");

                var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.UtcNow.AddDays(expireDays),
                    signingCredentials: new SigningCredentials(
                        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),
                        SecurityAlgorithms.HmacSha256
                    )
                );

                var jwt = new JwtSecurityTokenHandler().WriteToken(token);

                return Ok(new
                {
                    message = "Nâng cấp Seller thành công",
                    token = jwt,
                    role = "seller"
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
