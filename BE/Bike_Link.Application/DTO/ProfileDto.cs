using Microsoft.AspNetCore.Http;

namespace Bike_Link.Application.DTO
{
    public class ProfileDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Status { get; set; }
        public string? Role { get; set; }
        public DateTime? CreatedAt { get; set; }

    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
    }

    public class UpdateAvatarRequest
    {
        public string AvatarUrl { get; set; } = null!;
    }
}