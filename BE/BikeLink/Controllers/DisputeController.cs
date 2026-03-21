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
    public class DisputeController : ControllerBase
    {
        private readonly IDisputeService _disputeService;

        public DisputeController(IDisputeService disputeService)
        {
            _disputeService = disputeService;
        }

        /// <summary>
        /// Buyer mở khiếu nại — order phải ở trạng thái "shipped"
        /// </summary>
        [HttpPost("{orderId}")]
        public async Task<IActionResult> OpenDispute(
            int orderId,
            [FromBody] OpenDisputeRequest request)
        {
            try
            {
                int buyerId = User.GetUserId();
                var result = await _disputeService.OpenDisputeAsync(buyerId, orderId, request);

                return Ok(new
                {
                    success = true,
                    data = result,
                    message = "Khiếu nại đã được gửi thành công. Admin/Inspector sẽ xem xét."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Danh sách disputes đang chờ xử lý (Admin/Inspector)
        /// </summary>
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingDisputes()
        {
            try
            {
                var disputes = await _disputeService.GetPendingDisputesAsync();
                return Ok(new { data = disputes });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xem chi tiết dispute — Admin/Inspector thấy cả 2 kênh chat, buyer/seller chỉ thấy kênh mình
        /// </summary>
        [HttpGet("{disputeId}")]
        public async Task<IActionResult> GetDisputeDetail(int disputeId)
        {
            try
            {
                int userId = User.GetUserId();
                string role = User.GetRole();

                var detail = await _disputeService.GetDisputeDetailAsync(disputeId, userId, role);
                if (detail == null)
                    return NotFound(new { message = "Không tìm thấy khiếu nại" });

                return Ok(new { data = detail });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin/Inspector chuyển dispute sang "investigating"
        /// </summary>
        [HttpPut("{disputeId}/investigate")]
        public async Task<IActionResult> Investigate(int disputeId)
        {
            try
            {
                int staffId = User.GetUserId();
                await _disputeService.InvestigateDisputeAsync(disputeId, staffId);

                return Ok(new
                {
                    success = true,
                    message = "Đã chuyển sang trạng thái đang điều tra"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Admin/Inspector phán quyết dispute
        /// </summary>
        [HttpPost("{disputeId}/resolve")]
        public async Task<IActionResult> Resolve(
            int disputeId,
            [FromBody] ResolveDisputeRequest request)
        {
            try
            {
                int staffId = User.GetUserId();
                await _disputeService.ResolveDisputeAsync(disputeId, staffId, request);

                return Ok(new
                {
                    success = true,
                    message = $"Đã phán quyết: {request.Resolution}"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Seller phản hồi / giải trình
        /// </summary>
        [HttpPut("{orderId}/seller-response")]
        public async Task<IActionResult> SellerRespond(
            int orderId,
            [FromBody] SellerDisputeResponseRequest request)
        {
            try
            {
                int sellerId = User.GetUserId();
                await _disputeService.SellerRespondAsync(orderId, sellerId, request.Response);

                return Ok(new
                {
                    success = true,
                    message = "Phản hồi đã được gửi thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy dispute theo orderId
        /// </summary>
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetDisputeByOrder(int orderId)
        {
            try
            {
                var dispute = await _disputeService.GetDisputeByOrderIdAsync(orderId);
                if (dispute == null)
                    return NotFound(new { message = "Đơn hàng này chưa có khiếu nại" });

                return Ok(new { data = dispute });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy lịch sử chat theo kênh (buyer/seller)
        /// </summary>
        [HttpGet("{disputeId}/chats/{channel}")]
        public async Task<IActionResult> GetChats(int disputeId, string channel)
        {
            try
            {
                if (channel != "buyer" && channel != "seller")
                    return BadRequest(new { message = "Channel phải là 'buyer' hoặc 'seller'" });

                var chats = await _disputeService.GetChatsAsync(disputeId, channel);
                return Ok(new { data = chats });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
