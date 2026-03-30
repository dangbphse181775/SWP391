using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BikeLink.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu phải đăng nhập
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
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

        // GET: api/cart/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetCartByUserId(int userId)
        {
            CartDto cart = await _cartService.GetUserCartAsync(userId);
            if (cart == null)
                return NotFound(new { message = "Không tìm thấy giỏ hàng" });

            return Ok(cart);
        }

        // GET: api/cart/
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            int userId = CurrentUserId;
            CartDto cart = await _cartService.GetUserCartAsync(userId);
            if (cart == null)
                return NotFound(new { message = "Không tìm thấy giỏ hàng" });

            return Ok(new
            {
                data = cart,
                message = "Các xe đạp không còn active đã được tự động xóa khỏi giỏ hàng"
            });
        }

        // POST: api/cart/{userId}/items/{vehicleId}
        [HttpPost("{userId}/items/{vehicleId}")]
        public async Task<IActionResult> AddItemToCartByUserId(int userId, int vehicleId)
        {
            try
            {
                await _cartService.AddItemToCartAsync(userId, vehicleId);
                return Ok(new { message = "Đã thêm vào giỏ hàng" });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // POST: api/cart/items/{vehicleId}
        [HttpPost("items/{vehicleId}")]
        public async Task<IActionResult> AddItemToCart(int vehicleId)
        {
            try
            {
                int userId = CurrentUserId;
                await _cartService.AddItemToCartAsync(userId, vehicleId);
                return Ok(new { message = "Đã thêm vào giỏ hàng" });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // DELETE: api/cart/{userId}/items/{vehicleId}
        [HttpDelete("{userId}/items/{vehicleId}")]
        public async Task<IActionResult> RemoveItemFromCartByUserId(int userId, int vehicleId)
        {
            bool result = await _cartService.RemoveItemFromCartAsync(userId, vehicleId);

            if (!result)
                return NotFound(new { message = "Không tìm thấy xe trong giỏ hàng" });

            return Ok(new { message = "Đã xóa 1 sản phẩm khỏi giỏ hàng" });
        }

        // DELETE: api/cart/items/{vehicleId}
        [HttpDelete("items/{vehicleId}")]
        public async Task<IActionResult> RemoveItemFromCart(int vehicleId)
        {
            int userId = CurrentUserId;
            bool result = await _cartService.RemoveItemFromCartAsync(userId, vehicleId);

            if (!result)
                return NotFound(new { message = "Không tìm thấy xe trong giỏ hàng" });

            return Ok(new { message = "Đã xóa 1 sản phẩm khỏi giỏ hàng" });
        }
    }
}