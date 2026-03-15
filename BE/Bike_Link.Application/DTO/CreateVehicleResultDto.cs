namespace Bike_Link.Application.DTO
{
    public class CreateVehicleResultDto
    {
        public bool Success { get; set; }
        public int? VehicleId { get; set; }
        public decimal PostingFee { get; set; }
        public decimal? WalletBalance { get; set; }
        public decimal? AmountShort { get; set; }
        public string Message { get; set; } = null!;
    }
}
