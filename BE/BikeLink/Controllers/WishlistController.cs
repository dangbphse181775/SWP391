using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BikeLink.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu phải đăng nhập
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
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

        // GET: api/wishlist/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetWishlistByUserId(int userID)
        {
            WishlistDto wishlist = await _wishlistService.GetUserWishlistAsync(userID);
            if (wishlist == null)
                return NotFound(new { message = "Không tìm thấy wishlist" });

            return Ok(wishlist);
        }

        // GET: api/wishlist/
        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {

            int userID = CurrentUserId;
            WishlistDto wishlist = await _wishlistService.GetUserWishlistAsync(userID);
            if (wishlist == null)
                return NotFound(new { message = "Không tìm thấy wishlist" });

            return Ok(new
            {
                data = wishlist,
                message = "Các xe đạp không còn active đã được tự động xóa khỏi wishlist"
            });
        }


        // POST: api/wishlist/{wishlistId}/items/{vehicleId}
        [HttpPost("{userID}/items/{vehicleId}")]
        public async Task<IActionResult> AddItemToWishlistByUserId(int userID, int vehicleId)
        {
            try
            {
                await _wishlistService.AddItemToWishlistAsync(userID, vehicleId);
                return Ok(new { message = "Đã thêm vào wishlist" });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPost("items/{vehicleId}")]
        public async Task<IActionResult> AddItemToWishlist(int vehicleId)
        {
            try
            {
                int userID = CurrentUserId;
                await _wishlistService.AddItemToWishlistAsync(userID, vehicleId);
                return Ok(new { message = "Đã thêm vào wishlist" });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // DELETE: api/wishlist/{userId}/items/{vehicleId}
        [HttpDelete("{userId}/items/{vehicleId}")]
        public async Task<IActionResult> RemoveItemFromWishlistByUserId(int userId, int vehicleId)
        {
            bool result = await _wishlistService.RemoveItemFromWishlistAsync(userId, vehicleId);

            if (!result)
                return NotFound(new { message = "Không tìm thấy item trong wishlist" });

            return Ok(new { message = "Đã xóa khỏi wishlist" });
        }

        [HttpDelete("items/{vehicleId}")]
        public async Task<IActionResult> RemoveItemFromWishlist(int vehicleId)
        {
            int userID = CurrentUserId;
            bool result = await _wishlistService.RemoveItemFromWishlistAsync(userID, vehicleId);

            if (!result)
                return NotFound(new { message = "Không tìm thấy item trong wishlist" });

            return Ok(new { message = "Đã xóa khỏi wishlist" });
        }

    }
}