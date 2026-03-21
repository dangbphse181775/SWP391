namespace Bike_Link.Application.DTO
{
    public class DisputeListDto
    {
        public int DisputeId { get; set; }
        public int OrderId { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public string? OpenedByName { get; set; }
        public string? BuyerName { get; set; }
        public string? SellerName { get; set; }
        public decimal OrderAmount { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
