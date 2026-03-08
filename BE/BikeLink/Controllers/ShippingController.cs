using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ShippingController : ControllerBase
    {
        private readonly IShippingService _shippingService;

        public ShippingController(IShippingService shippingService)
        {
            _shippingService = shippingService;
        }

        // GET: api/shipping/order/{orderId}
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetShippingByOrderId(int orderId)
        {
            ShippingDto shipping = await _shippingService.GetByOrderIdAsync(orderId);

            if (shipping == null)
                return NotFound(new { message = "Không tìm thấy thông tin giao hàng" });

            return Ok(shipping);
        }

        // GET: api/shipping/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetShippingByShippingId(int id)
        {
            ShippingDto shipping = await _shippingService.GetByIdAsync(id);

            if (shipping == null)
                return NotFound(new { message = "Không tìm thấy thông tin giao hàng" });

            return Ok(shipping);
        }

        // POST: api/shipping/order/{orderId}
        [HttpPost("order/{orderId}")]
        public async Task<IActionResult> CreateShipping(
            int orderId,
            [FromBody] CreateShippingRequest request)
        {
            try
            {
                int shippingId = await _shippingService.CreateAsync(orderId, request);

                return Ok(new { message = "Tạo thông tin giao hàng thành công", shippingId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/shipping/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShipping(
            int id,
            [FromBody] UpdateShippingRequest request)
        {
            try
            {
                await _shippingService.UpdateAsync(id, request);

                return Ok(new { message = "Cập nhật thông tin giao hàng thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/shipping/order/{orderId}
        [HttpPut("order/{orderId}")]
        public async Task<IActionResult> UpdateShippingByOrderId(
            int orderId,
            [FromBody] UpdateShippingRequest request)
        {
            try
            {
                await _shippingService.UpdateByOrderIdAsync(orderId, request);

                return Ok(new { message = "Cập nhật thông tin giao hàng thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/shipping/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShippingByShippingId(int id)
        {
            try
            {
                await _shippingService.DeleteAsync(id);

                return Ok(new { message = "Xóa thông tin giao hàng thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/shipping/order/{orderId}
        [HttpDelete("order/{orderId}")]
        public async Task<IActionResult> DeleteShippingByOrderId(int orderId)
        {
            try
            {
                await _shippingService.DeleteByOrderIdAsync(orderId);

                return Ok(new { message = "Xóa thông tin giao hàng thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
