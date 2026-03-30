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
        private readonly IProfileService _profileService;

        public OrderController(IOrderService orderService, IProfileService profileService)
        {
            _orderService = orderService;
            _profileService = profileService;
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
        /// Seller xác nhận đã giao xe + upload ảnh bằng chứng → order "shipped"
        /// </summary>
        [HttpPost("confirm-shipped/{orderId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ConfirmShipped(int orderId, IFormFile shippingProof)
        {
            try
            {
                int sellerId = User.GetUserId();
                await _orderService.SellerConfirmShippedAsync(sellerId, orderId, shippingProof);

                return Ok(new
                {
                    success = true,
                    orderId,
                    message = "Đã xác nhận giao xe thành công. Đơn hàng chuyển sang 'shipped'."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Buyer xác nhận đã nhận hàng → order "completed", tiền chuyển cho seller
        /// </summary>
        [HttpPost("confirm-received/{orderId}")]
        public async Task<IActionResult> ConfirmReceived(int orderId)
        {
            try
            {
                int buyerId = User.GetUserId();
                await _orderService.BuyerConfirmReceivedAsync(buyerId, orderId);

                return Ok(new
                {
                    success = true,
                    orderId,
                    message = "Đã xác nhận nhận hàng. Tiền đã chuyển cho seller."
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

        
        // Lấy chi tiết đơn hàng
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            try
            {
                OrderDetailResponseDto order = await _orderService.GetOrderByOrderIdAsync(orderId);
                
                if (order == null)
                    return NotFound(new { message = "Không tìm thấy đơn hàng" });
                
                // Optional: Kiểm tra quyền truy cập
                int userId = User.GetUserId();
                string userRole = User.GetRole();
                ProfileDto userProfile = await _profileService.GetProfileAsync(userId);
                // Admin có thể xem tất cả, buyer/seller chỉ xem được đơn của mình
                if (userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                    return Ok(order);
                if (order.BuyerName!= userProfile.FullName && order.SellerName != userProfile.FullName)
                {
                    return Unauthorized(new { message = "Bạn chỉ có thể tìm kiếm đơn hàng của mình" }); // Chỉ buyer hoặc seller mới được xem
                }
                
                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/order
        /// <summary>
        /// Lấy toàn bộ danh sách đơn hàng của chính mình (vừa là người mua, vừa là người bán)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            try
            {
                int userId = User.GetUserId();
                
                var orders = await _orderService.GetOrdersByUserIdAsync(userId, "All");

                return Ok(new
                {
                    data = orders,
                    message = "Lấy danh sách đơn hàng thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/order/user/{userId}
        /// <summary>
        /// Lấy toàn bộ danh sách đơn hàng theo userId cụ thể
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetOrdersByUserId(int userId)
        {
            try
            {
                // Bảo mật: Chỉ người đó HOẶC Admin mới được lấy danh sách đơn hàng của người đó
                int currentUserId = User.GetUserId();
                string userRole = User.GetRole();

                if (currentUserId != userId && !userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                {
                    return StatusCode(403, new { message = "Bạn không có quyền lấy danh sách đơn hàng của người khác" });
                }

                
                var orders = await _orderService.GetOrdersByUserIdAsync(userId, "All");

                return Ok(new
                {
                    data = orders,
                    message = "Lấy danh sách đơn hàng thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/order/buyer")]
        public async Task<IActionResult> GetOrdersByUserIdRoleBuyer()
        {
            try
            {
                // Bảo mật: Chỉ người đó HOẶC Admin mới được lấy danh sách đơn hàng của người đó
                int currentUserId = User.GetUserId();
                string userRole = User.GetRole();


                var orders = await _orderService.GetOrdersByUserIdAsync(currentUserId, "Buyer");

                return Ok(new
                {
                    data = orders,
                    message = "Lấy danh sách đơn hàng thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/order/seller")]
        public async Task<IActionResult> GetOrdersByUserIdRoleSeller()
        {
            try
            {
                // Bảo mật: Chỉ người đó HOẶC Admin mới được lấy danh sách đơn hàng của người đó
                int currentUserId = User.GetUserId();
                string userRole = User.GetRole();

                var orders = await _orderService.GetOrdersByUserIdAsync(currentUserId, "Seller");

                return Ok(new
                {
                    data = orders,
                    message = "Lấy danh sách đơn hàng thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
