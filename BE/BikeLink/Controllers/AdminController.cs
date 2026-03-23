using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IAdminVehicleService _service;

        public AdminController(IAdminVehicleService service)
        {
            _service = service;
        }

        [HttpGet("vehicles/pending")]
        public async Task<IActionResult> Pending()
        {
            return Ok(await _service.GetPendingAsync());
        }

        [HttpGet("vehicles/{id}")]
        public async Task<IActionResult> Detail(int id)
        {
            var v = await _service.GetDetailAsync(id);

            if (v == null)
                return NotFound();

            return Ok(v);
        }

        [HttpPost("vehicles/{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            await _service.ApproveAsync(id);

            return Ok(new { message = "Đã duyệt bài đăng" });
        }

        [HttpPost("vehicles/{id}/reject")]
        public async Task<IActionResult> Reject(
            int id,
            [FromBody] RejectVehicleRequest req)
        {
            await _service.RejectAsync(id, req.AdminNote);

            return Ok(new { message = "Đã từ chối bài đăng" });
        }

        [HttpGet("dashboard/overview")]
        public async Task<IActionResult> DashboardOverview()
        {
            AdminDashboardStatsDto stats = await _service.GetDashboardStatsAsync();
            return Ok(stats);
        }
    }
}
