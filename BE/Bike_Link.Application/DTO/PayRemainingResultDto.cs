namespace Bike_Link.Application.DTO
{
    public class PayRemainingResultDto
    {
        public bool Success { get; set; }
        public int OrderId { get; set; }
        public decimal RemainingAmount { get; set; }
        public decimal WalletBalance { get; set; }
        public decimal? AmountShort { get; set; }
        public string Message { get; set; } = null!;
    }
}
