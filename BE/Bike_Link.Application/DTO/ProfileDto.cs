using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

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
        // Validation cho FullName: min length 2, max length 100
        //[MinLength(2, ErrorMessage = "Tên phải có ít nhất 2 ký tự")]
        //[MaxLength(100, ErrorMessage = "Tên không được vượt quá 100 ký tự")]
        public string? FullName { get; set; }
        // Validation cho Phone: đúng định dạng số điện thoại Việt Nam
        //[RegularExpression(@"^0\d{9}$", ErrorMessage = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0")]
        public string? Phone { get; set; }
    }

    public class UpdateAvatarRequest
    {
        // Validation cho AvatarUrl: bắt buộc và phải là URL hợp lệ
        [Required(ErrorMessage = "Avatar URL là bắt buộc")]
        [Url(ErrorMessage = "Phải là URL hợp lệ")]
        public string AvatarUrl { get; set; } = null!;
    }
}