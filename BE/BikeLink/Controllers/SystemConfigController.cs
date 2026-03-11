using Bike_Link.Application.IService;
using BikeLink.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SystemConfigController : ControllerBase
    {
        private readonly ISystemConfigService _service;

        public SystemConfigController(ISystemConfigService service)
        {
            _service = service;
        }

        /// <summary>
        /// [Admin] Xem tất cả config hệ thống
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                string role = User.GetRole();
                if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
                    return Forbid();

                var configs = await _service.GetAllAsync();
                return Ok(new
                {
                    success = true,
                    configs = configs.Select(c => new
                    {
                        c.Key,
                        c.Value,
                        c.Description,
                        c.UpdatedAt
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// [Admin] Cập nhật 1 config
        /// </summary>
        [HttpPut("{key}")]
        public async Task<IActionResult> Update(string key, [FromBody] UpdateConfigRequest request)
        {
            try
            {
                string role = User.GetRole();
                if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
                    return Forbid();

                await _service.UpdateAsync(key, request.Value);

                return Ok(new
                {
                    success = true,
                    key,
                    value = request.Value,
                    message = $"Đã cập nhật config '{key}' thành '{request.Value}'"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }

    public class UpdateConfigRequest
    {
        public string Value { get; set; } = null!;
    }
}
