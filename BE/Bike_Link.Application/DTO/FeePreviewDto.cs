namespace Bike_Link.Application.DTO
{
    public class FeePreviewDto
    {
        public decimal PostingFeeRate { get; set; }
        public string PostingFeeRatePct { get; set; } = null!;
        public decimal VehiclePrice { get; set; }
        public decimal EstimatedFee { get; set; }
    }
}
