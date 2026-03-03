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
    [Authorize]
    public class InspectorController : ControllerBase
    {
        private readonly IInspectorService _service;

        public InspectorController(IInspectorService service)
        {
            _service = service;
        }

        [HttpGet("vehicles/pending")]
        public async Task<IActionResult> Pending()
        {
            return Ok(await _service.GetPendingAsync());
        }

        [HttpPost("vehicles/{id}/report")]
        public async Task<IActionResult> CreateReport(
            int id,
            [FromBody] CreateInspectionReportRequest req)
        {
            int inspectorUserId = User.GetUserId();

            await _service.CreateReportAsync(id, inspectorUserId, req);

            return Ok(new { message = "Kiểm định thành công" });
        }

        [HttpGet("vehicles/{id}")]
        public async Task<IActionResult> Detail(int id)
        {
            var result = await _service
                .GetVehicleDetailForInspectionAsync(id);

            if (result == null)
                return NotFound(new
                {
                    message = "Không tìm thấy xe cần kiểm định"
                });

            return Ok(result);
        }
    }
}
