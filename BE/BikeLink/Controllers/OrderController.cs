using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using BikeLink.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        /// <summary>
        /// Thanh toán bằng ví — mua các sản phẩm đã chọn từ giỏ hàng
        /// </summary>
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout(
            [FromBody] CheckoutRequest request)
        {
            try
            {
                int buyerId = User.GetUserId();

                var result = await _orderService.CheckoutAsync(
                    buyerId, request);

                if (!result.Success)
                {
                    // Thiếu tiền → trả về 400 kèm thông tin để FE xử lý
                    return BadRequest(new
                    {
                        success = false,
                        totalAmount = result.TotalAmount,
                        walletBalance = result.WalletBalance,
                        amountShort = result.AmountShort,
                        message = result.Message
                    });
                }

                // Thành công
                return Ok(new
                {
                    success = true,
                    orderIds = result.OrderIds,
                    totalAmount = result.TotalAmount,
                    walletBalance = result.WalletBalance,
                    message = result.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
