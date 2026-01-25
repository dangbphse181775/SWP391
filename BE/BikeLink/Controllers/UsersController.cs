using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service;

        public UsersController(IUserService service)
        {
            _service = service;
        }

        // Tạm thời truyền userId qua Header (sau này lấy từ JWT)
        [HttpPost("upgrade-to-seller")]
        public async Task<IActionResult> UpgradeToSeller(
            [FromBody] UpgradeToSellerRequest req,
            [FromHeader] int userId)
        {
            try
            {
                await _service.UpgradeToSellerAsync(userId, req);
                return Ok(new { message = "Nâng cấp Seller thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
