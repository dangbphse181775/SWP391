using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using BikeLink.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;
        private readonly ISellerInspectionService _inspectionService;

        public SellerController(ISellerService sellerService, ISellerInspectionService inspectionService)
        {
            _sellerService = sellerService;
            _inspectionService = inspectionService;
        }

        [Authorize]
        [HttpPost("vehicles")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateVehicle([FromForm] CreateVehicleRequest req)
        {
            try
            {
                int userId = User.GetUserId();
                var result = await _sellerService.CreateVehicleAsync(req, userId);

                if (!result.Success)
                {
                    return StatusCode(402, new
                    {
                        success = false,
                        postingFee = result.PostingFee,
                        walletBalance = result.WalletBalance,
                        amountShort = result.AmountShort,
                        message = result.Message
                    });
                }

                return Ok(new
                {
                    success = true,
                    vehicleId = result.VehicleId,
                    postingFee = result.PostingFee,
                    walletBalance = result.WalletBalance,
                    message = result.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("fee-preview")]
        public async Task<IActionResult> FeePreview([FromQuery] decimal price)
        {
            if (price <= 0)
                return BadRequest(new { message = "Giá xe phải lớn hơn 0" });

            var result = await _sellerService.GetFeePreviewAsync(price);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("vehicles")]
        public async Task<IActionResult> MyVehicles()
        {
            int userId = User.GetUserId();

            var list = await _sellerService.GetMyVehiclesAsync(userId);
            return Ok(list);
        }

        [Authorize]
        [HttpGet("vehicles/{id:int}")]
        public async Task<IActionResult> Detail(int id)
        {
            int userId = User.GetUserId();

            var v = await _sellerService.GetDetailAsync(id, userId);
            if (v == null)
                return NotFound(new { message = "Không tìm thấy bài đăng" });

            return Ok(v);
        }

        [Authorize]
        [HttpPut("vehicles/{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVehicleRequest req)
        {
            int userId = User.GetUserId();

            await _sellerService.UpdateAsync(id, req, userId);
            return Ok(new { message = "Cập nhật thành công" });
        }

        [Authorize]
        [HttpDelete("vehicles/{id:int}")] // Ẩn tin
        public async Task<IActionResult> Hide(int id)
        {
            int userId = User.GetUserId();

            await _sellerService.HideAsync(id, userId);
            return Ok(new { message = "Đã ẩn tin" });
        }

        [Authorize]
        [HttpGet("vehicles/{id}/rejection-reason")]
        public async Task<IActionResult> GetRejectReason(int id)
        {
            int userId = User.GetUserId();

            try
            {
                var result =
                    await _sellerService.GetRejectReasonAsync(id, userId);

                if (result == null)
                    return NotFound(new { message = "Không tìm thấy bài đăng" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("vehicles/{id}/inspection-report")]
        public async Task<IActionResult> InspectionReport(int id)
        {
            int sellerId = User.GetUserId();

            var result = await _inspectionService
                .GetInspectionReportAsync(id, sellerId);

            if (result == null)
                return NotFound(new
                {
                    message = "Không tìm thấy báo cáo kiểm định"
                });

            return Ok(result);
        }
    }
}
