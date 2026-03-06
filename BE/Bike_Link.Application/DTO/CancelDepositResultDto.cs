namespace Bike_Link.Application.DTO
{
    public class CancelDepositResultDto
    {
        public bool Success { get; set; }
        public int OrderId { get; set; }
        public decimal RefundAmount { get; set; }
        public decimal WalletBalance { get; set; }
        public string Message { get; set; } = null!;
    }
}
