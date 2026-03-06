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
                var result = await _orderService.CheckoutAsync(buyerId, request);

                if (!result.Success)
                    return BadRequest(new
                    {
                        success = false,
                        totalAmount = result.TotalAmount,
                        walletBalance = result.WalletBalance,
                        amountShort = result.AmountShort,
                        message = result.Message
                    });

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
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Đặt cọc 20% giá trị xe — khóa xe, hẹn 72h thanh toán
        /// </summary>
        [HttpPost("deposit")]
        public async Task<IActionResult> Deposit(
            [FromBody] DepositOrderRequest request)
        {
            try
            {
                int buyerId = User.GetUserId();
                var result = await _orderService.DepositAsync(buyerId, request);

                if (!result.Success)
                    return BadRequest(new
                    {
                        success = false,
                        vehiclePrice = result.VehiclePrice,
                        depositAmount = result.DepositAmount,
                        walletBalance = result.WalletBalance,
                        amountShort = result.AmountShort,
                        message = result.Message
                    });

                return Ok(new
                {
                    success = true,
                    orderId = result.OrderId,
                    vehiclePrice = result.VehiclePrice,
                    depositAmount = result.DepositAmount,
                    walletBalance = result.WalletBalance,
                    depositExpiry = result.DepositExpiry,
                    message = result.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Hủy cọc — hoàn 95% nếu trong hạn 72h
        /// </summary>
        [HttpPost("cancel-deposit/{orderId}")]
        public async Task<IActionResult> CancelDeposit(int orderId)
        {
            try
            {
                int buyerId = User.GetUserId();
                var result = await _orderService.CancelDepositAsync(buyerId, orderId);

                return Ok(new
                {
                    success = true,
                    orderId = result.OrderId,
                    refundAmount = result.RefundAmount,
                    walletBalance = result.WalletBalance,
                    message = result.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Thanh toán khoản còn lại (80%) sau khi đặt cọc — xe chuyển thành "sold"
        /// </summary>
        [HttpPost("pay-remaining/{orderId}")]
        public async Task<IActionResult> PayRemaining(int orderId)
        {
            try
            {
                int buyerId = User.GetUserId();
                var result = await _orderService.PayRemainingAsync(buyerId, orderId);

                if (!result.Success)
                    return BadRequest(new
                    {
                        success = false,
                        orderId = result.OrderId,
                        remainingAmount = result.RemainingAmount,
                        walletBalance = result.WalletBalance,
                        amountShort = result.AmountShort,
                        message = result.Message
                    });

                return Ok(new
                {
                    success = true,
                    orderId = result.OrderId,
                    remainingAmount = result.RemainingAmount,
                    walletBalance = result.WalletBalance,
                    message = result.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// [Admin] Xử lý tự động các đơn cọc quá hạn 72h
        /// </summary>
        [HttpPost("process-expired-deposits")]
        [AllowAnonymous]
        public async Task<IActionResult> ProcessExpiredDeposits()
        {
            try
            {
                await _orderService.ProcessExpiredDepositsAsync();
                return Ok(new { success = true, message = "Đã xử lý các đơn cọc quá hạn" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
