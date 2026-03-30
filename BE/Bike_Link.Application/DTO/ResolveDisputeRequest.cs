namespace Bike_Link.Application.DTO
{
    public class ResolveDisputeRequest
    {
        /// <summary>
        /// refund_full | seller_win | partial_refund
        /// </summary>
        public string Resolution { get; set; } = null!;

        /// <summary>
        /// Ghi chú phán quyết
        /// </summary>
        public string? AdminNote { get; set; }

        /// <summary>
        /// Phần trăm hoàn tiền cho buyer (0-100). Chỉ dùng khi Resolution = partial_refund.
        /// </summary>
        public decimal? RefundPercentage { get; set; }
    }
}
