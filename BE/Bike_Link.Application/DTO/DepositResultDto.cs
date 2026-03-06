namespace Bike_Link.Application.DTO
{
    public class DepositResultDto
    {
        public bool Success { get; set; }
        public int? OrderId { get; set; }
        public decimal VehiclePrice { get; set; }
        public decimal DepositAmount { get; set; }
        public decimal WalletBalance { get; set; }
        public decimal? AmountShort { get; set; }
        public DateTime? DepositExpiry { get; set; }
        public string Message { get; set; } = null!;
    }
}
