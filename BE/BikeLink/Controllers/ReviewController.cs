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
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // Helper property để lấy userId từ JWT token
        private int CurrentUserId
        {
            get
            {
                return User.GetUserId();
            }
        }

        // GET: api/review/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReviewById(int id)
        {
            ReviewDto review = await _reviewService.GetByIdAsync(id);

            if (review == null)
                return NotFound(new { message = "Không tìm thấy đánh giá" });

            return Ok(review);
        }

        // GET: api/review/order/{orderId}
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetReviewByOrderId(int orderId)
        {
            ReviewDto review = await _reviewService.GetByOrderIdAsync(orderId);

            if (review == null)
                return NotFound(new { message = "Không tìm thấy đánh giá" });

            return Ok(review);
        }

        // GET: api/review/reviewer/{reviewerId}
        [HttpGet("reviewer/{reviewerId}")]
        public async Task<IActionResult> GetReviewsByReviewerId(int reviewerId)
        {
            List<ReviewDto> reviews = await _reviewService.GetByReviewerIdAsync(reviewerId);
            return Ok(reviews);
        }

        // GET: api/review/target/{targetUserId}
        [HttpGet("target/{targetUserId}")]
        public async Task<IActionResult> GetReviewsByTargetUserId(int targetUserId)
        {
            List<ReviewDto> reviews = await _reviewService.GetByTargetUserIdAsync(targetUserId);
            return Ok(reviews);
        }

        // GET: api/review
        [HttpGet]
        public async Task<IActionResult> GetAllReviews()
        {
            List<ReviewDto> reviews = await _reviewService.GetAllAsync();
            return Ok(reviews);
        }

        // POST: api/review
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
        {
            try
            {
                int userId = CurrentUserId;
                int reviewId = await _reviewService.CreateAsync(userId, request);

                return Ok(new { message = "Tạo đánh giá thành công", reviewId });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/review/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(
            int id,
            [FromBody] UpdateReviewRequest request)
        {
            try
            {
                int userId = CurrentUserId;
                await _reviewService.UpdateAsync(id, userId, request);

                return Ok(new { message = "Cập nhật đánh giá thành công" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/review/order/{orderId}
        [HttpPut("order/{orderId}")]
        public async Task<IActionResult> UpdateReviewByOrderId(
            int orderId,
            [FromBody] UpdateReviewRequest request)
        {
            try
            {
                int userId = CurrentUserId;
                await _reviewService.UpdateByOrderIdAsync(orderId, userId, request);

                return Ok(new { message = "Cập nhật đánh giá thành công" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/review/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                int userId = CurrentUserId;
                await _reviewService.DeleteAsync(id, userId);

                return Ok(new { message = "Xóa đánh giá thành công" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // DELETE: api/review/order/{orderId}
        [HttpDelete("order/{orderId}")]
        public async Task<IActionResult> DeleteReviewByOrderId(int orderId)
        {
            try
            {
                int userId = CurrentUserId;
                await _reviewService.DeleteByOrderIdAsync(orderId, userId);

                return Ok(new { message = "Xóa đánh giá thành công" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}