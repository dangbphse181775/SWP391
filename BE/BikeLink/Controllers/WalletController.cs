using Bike_Link.Application.IService;
using Bike_Link.Application.Services;
using BikeLink.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _service;

        public WalletController(IWalletService service)
        {
            _service = service;
        }

        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance()
        {
            int userId = User.GetUserId();
            var result =
                await _service.GetBalanceAsync(userId);

            return Ok(result);
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            int userId = User.GetUserId();

            var list =
                await _service.GetTransactionsAsync(userId);

            return Ok(list);
        }
    }
}
