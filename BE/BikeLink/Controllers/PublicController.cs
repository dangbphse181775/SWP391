using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class PublicController : ControllerBase
    {
        private readonly IPublicVehicleService _service;

        public PublicController(IPublicVehicleService service)
        {
            _service = service;
        }

        
        [HttpGet("vehicles")]
        public async Task<IActionResult> Search([FromQuery] VehicleSearchOptions options)
        {
            var list = await _service.SearchAsync(options);
            return Ok(list);
        }

        [HttpGet("vehicles/{id}")]
        public async Task<IActionResult> Detail(int id)
        {
            var v = await _service.GetDetailAsync(id);

            if (v == null) return NotFound();

            return Ok(v);
        }
    }
}
