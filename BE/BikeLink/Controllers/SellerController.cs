using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
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

        [HttpPost("vehicles")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateVehicle(
            [FromForm] CreateVehicleRequest req,
            [FromHeader] int sellerId // tạm thời, sau này lấy từ JWT
        )
        {
            var id = await _sellerService.CreateVehicleAsync(req, sellerId);
            return Ok(new { message = "Đăng xe thành công", vehicleId = id });
        }
        [HttpGet("vehicles")]
        public async Task<IActionResult> MyVehicles([FromHeader] int sellerId)
        => Ok(await _sellerService.GetMyVehiclesAsync(sellerId));

        [HttpGet("vehicles/{id}")]
        public async Task<IActionResult> Detail(int id, [FromHeader] int sellerId)
        {
            var v = await _sellerService.GetDetailAsync(id, sellerId);
            return v == null ? NotFound() : Ok(v);
        }

        [HttpPut("vehicles/{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateVehicleRequest req,
            [FromHeader] int sellerId)
        {
            await _sellerService.UpdateAsync(id, req, sellerId);
            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("vehicles/{id}")]    // Ẩn Tin
        public async Task<IActionResult> Hide(int id, [FromHeader] int sellerId)
        {
            await _sellerService.HideAsync(id, sellerId);
            return Ok(new { message = "Đã ẩn tin" });
        }
    }
}
