using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using BikeLink.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public SellerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }

        [HttpPost("vehicles")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateVehicle([FromForm] CreateVehicleRequest req)
        {
            int userId = User.GetUserId();

            var id = await _sellerService.CreateVehicleAsync(req, userId);

            return Ok(new
            {
                message = "Đăng xe thành công",
                vehicleId = id
            });
        }

        [HttpGet("vehicles")]
        public async Task<IActionResult> MyVehicles()
        {
            int userId = User.GetUserId();

            var list = await _sellerService.GetMyVehiclesAsync(userId);
            return Ok(list);
        }

        [HttpGet("vehicles/{id:int}")]
        public async Task<IActionResult> Detail(int id)
        {
            int userId = User.GetUserId();

            var v = await _sellerService.GetDetailAsync(id, userId);
            if (v == null)
                return NotFound(new { message = "Không tìm thấy bài đăng" });

            return Ok(v);
        }

        [HttpPut("vehicles/{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVehicleRequest req)
        {
            int userId = User.GetUserId();

            await _sellerService.UpdateAsync(id, req, userId);
            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("vehicles/{id:int}")] // Ẩn tin
        public async Task<IActionResult> Hide(int id)
        {
            int userId = User.GetUserId();

            await _sellerService.HideAsync(id, userId);
            return Ok(new { message = "Đã ẩn tin" });
        }
    }
}
