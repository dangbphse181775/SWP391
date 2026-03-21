namespace Bike_Link.Application.DTO
{
    public class DisputeDetailDto
    {
        public int DisputeId { get; set; }
        public int OrderId { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public string? EvidenceUrls { get; set; }
        public string? SellerResponse { get; set; }
        public string? AdminNote { get; set; }
        public string? Resolution { get; set; }
        public decimal? RefundAmount { get; set; }

        // Người mở dispute
        public string? OpenedByName { get; set; }

        // Người resolve
        public string? ResolvedByName { get; set; }

        public DateTime? CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }

        // Thông tin Order
        public decimal OrderAmount { get; set; }

        // Thông tin Buyer
        public string? BuyerName { get; set; }
        public string? BuyerPhone { get; set; }
        public string? BuyerEmail { get; set; }

        // Thông tin Seller
        public string? SellerName { get; set; }
        public string? SellerPhone { get; set; }
        public string? SellerEmail { get; set; }

        // Xe liên quan
        public List<DisputeVehicleDto> Vehicles { get; set; } = new();

        // Lịch sử chat (buyer channel)
        public List<DisputeChatDto>? BuyerChats { get; set; }

        // Lịch sử chat (seller channel)
        public List<DisputeChatDto>? SellerChats { get; set; }
    }

    public class DisputeVehicleDto
    {
        public int VehicleId { get; set; }
        public string? VehicleName { get; set; }
        public decimal Price { get; set; }
        public bool? IsInspected { get; set; }
        public string? InspectionResult { get; set; }
        public int? InspectorId { get; set; }
    }
}
