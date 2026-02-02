using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace BikeLink.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
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
        public async Task<IActionResult> GetProfile()
        {
            int userID = CurrentUserId;
            ProfileDto profile = await _profileService.GetProfileAsync(userID);
            return Ok(profile);
        }

        // Lấy thông tin profile của user theo ID 
        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetProfileById(int userId)
        {
            ProfileDto profile = await _profileService.GetProfileAsync(userId);
            return Ok(profile);
        }

        // Cập nhật thông tin profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {

            int userID = CurrentUserId;
            ProfileDto profile = await _profileService.UpdateProfileAsync(userID, request);
            return Ok(new
            {
                data = profile,
                message = "Cập nhật thông tin hồ sơ thành công"
            });
        }


        // Cập nhật avatar
        [HttpPatch("profile/avatar")]
        public async Task<IActionResult> UpdateAvatar([FromForm] UpdateAvatarRequest request)
        {
            int userID = CurrentUserId;
            var profile = await _profileService.UpdateAvatarAsync(userID, request);
            return Ok(new
            {
                data = profile,
                message = "Cập nhật avatar thành công"
            });
        }
    }
}