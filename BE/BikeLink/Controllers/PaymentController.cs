using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Application.Services;
using Bike_Link.Domain.IRepository;
using BikeLink.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/payment")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly VNPayService _vnpay;
        private readonly IWalletService _walletService;


        public PaymentController(
            VNPayService vnpay,
            IWalletService walletService)
        {
            _vnpay = vnpay;
            _walletService = walletService;
        }

        [Authorize]
        [HttpPost("deposit")]
        public async Task<IActionResult> Deposit(
    [FromBody] DepositRequest req)
        {
            int userId = User.GetUserId();

            string url =
                await _walletService.CreateDepositAsync(
                    userId,
                    req.Amount,
                    HttpContext
                );

            return Ok(new
            {
                paymentUrl = url
            });
        }

        [AllowAnonymous]
        [HttpGet("vnpay-return")]
        public async Task<IActionResult> VNPayReturn()
        {
            string result =
                await _walletService.HandleVNPayReturnAsync(
                    Request.Query
                );

            return Ok(new
            {
                message = result
            });
        }
        
    }
}
