using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using BikeLink.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        [Authorize(Roles = "seller")]
        [HttpPost("vehicles")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateVehicle([FromForm] CreateVehicleRequest req)
        {
            int sellerId = User.GetUserId();
            var id = await _sellerService.CreateVehicleAsync(req, sellerId);
            return Ok(new { message = "Đăng xe thành công", vehicleId = id });
        }

        [Authorize(Roles = "seller")]
        [HttpGet("vehicles")]
        public async Task<IActionResult> MyVehicles()
        {
            int sellerId = User.GetUserId();
            return Ok(await _sellerService.GetMyVehiclesAsync(sellerId));
        }

        [Authorize(Roles = "seller")]
        [HttpGet("vehicles/{id}")]
        public async Task<IActionResult> Detail(int id)
        {
            int sellerId = User.GetUserId();

            var v = await _sellerService.GetDetailAsync(id, sellerId);
            return v == null ? NotFound() : Ok(v);
        }

        [Authorize(Roles = "seller")]
        [HttpPut("vehicles/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVehicleRequest req)
        {
            int sellerId = User.GetUserId();

            await _sellerService.UpdateAsync(id, req, sellerId);
            return Ok(new { message = "Cập nhật thành công" });
        }

        [Authorize(Roles = "seller")]
        [HttpDelete("vehicles/{id}")] // Ẩn tin
        public async Task<IActionResult> Hide(int id)
        {
            int sellerId = User.GetUserId();

            await _sellerService.HideAsync(id, sellerId);
            return Ok(new { message = "Đã ẩn tin" });
        }
    }
}
