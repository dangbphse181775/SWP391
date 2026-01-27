using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Bike_Link.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;

        public AuthService(IAuthRepository repo, IConfiguration config)
        {
            _repo = repo;
            _config = config;
        }

        public async Task<RegisterResultDto> RegisterAsync(RegisterRequest req)
        {
            if (await _repo.EmailExistsAsync(req.Email))
                throw new InvalidOperationException("Email đã tồn tại");

            int buyerRoleId = await _repo.GetRoleIdAsync("Buyer");

            var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);
            int userId = await _repo.InsertUserAsync(req.Email, req.FullName, hash, buyerRoleId);

            return new RegisterResultDto
            {
                UserId = userId,
                Email = req.Email,
                FullName = req.FullName,
                Role = "Buyer"
            };
        }

        public async Task<LoginResultDto> LoginAsync(LoginRequest req)
        {
            var user = await _repo.GetByEmailAsync(req.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                throw new UnauthorizedAccessException();

            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Role, user.RoleName),
            new Claim(ClaimTypes.Name, user.FullName ?? "")
        };

            var key = _config["Jwt:Key"]!;
            var expireDays = int.Parse(_config["Jwt:ExpireDays"] ?? "7");

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(expireDays),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    SecurityAlgorithms.HmacSha256
                )
            );

            return new LoginResultDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                UserId = user.UserId,
                FullName = user.FullName ?? "",
                Email = user.Email!,
                Role = user.RoleName
            };
        }
    }
}
