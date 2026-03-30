using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace BikeLink.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu phải đăng nhập
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        // Helper method để lấy userId từ JWT token
        private int CurrentUserId
        {
            get
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    throw new UnauthorizedAccessException("Không tìm thấy thông tin người dùng");
                }
                return int.Parse(userIdClaim);
            }
        }


        // Lấy thông tin profile của user hiện tại
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                int userID = CurrentUserId;
                ProfileDto profile = await _profileService.GetProfileAsync(userID);
                return Ok(profile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // Lấy thông tin profile của user theo ID (Admin)
        [HttpGet("profile/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetProfileById(int userId)
        {
            try
            {
                ProfileDto profile = await _profileService.GetProfileAsync(userId);
                return Ok(profile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // Cập nhật thông tin profile
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                int userID = CurrentUserId;
                // Cập nhật profile thông qua service
                ProfileDto profile = await _profileService.UpdateProfileAsync(userID, request);
                return Ok(new
                {
                    data = profile,
                    message = "Cập nhật thông tin hồ sơ thành công"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Cập nhật thông tin profile (Admin)
        [HttpPut("profile/{userId}")]
        [Authorize]
        public async Task<IActionResult> UpdateProfileById([FromBody] UpdateProfileRequest request, int userId)
        {
            try
            {

                int userID = userId;
                // Cập nhật profile thông qua service
                ProfileDto profile = await _profileService.UpdateProfileAsync(userID, request);
                return Ok(new
                {
                    data = profile,
                    message = "Cập nhật thông tin hồ sơ thành công"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // Cập nhật avatar
        [HttpPatch("profile/avatar")]
        public async Task<IActionResult> UpdateAvatar([FromBody] UpdateAvatarRequest request)
        {
            try
            {

                int userID = CurrentUserId;
                // Cập nhật avatar thông qua service
                ProfileDto profile = await _profileService.UpdateAvatarAsync(userID, request);
                return Ok(new
                {
                    data = profile,
                    message = "Cập nhật avatar thành công"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Lấy danh sách tất cả người dùng (Admin only)
        [HttpGet("users")]
        [Authorize]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                List<UserListDto> users = await _profileService.GetAllUsersAsync();
                return Ok(new
                {
                    total = users.Count,
                    data = users
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách người dùng", error = ex.Message });
            }
        }

        // Cập nhật status của người dùng (Admin only)
        [HttpPatch("users/{userId}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateUserStatus(int userId, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                ProfileDto profile = await _profileService.UpdateStatusAsync(userId, request);
                return Ok(new
                {
                    data = profile,
                    message = "Cập nhật trạng thái người dùng thành công"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật trạng thái người dùng", error = ex.Message });
            }
        }
    }
}