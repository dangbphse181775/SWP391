namespace Bike_Link.Application.DTO
{
    public class SellerVehicleDto
    {
        public int VehicleId { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public string? Status { get; set; }
        public string? Condition { get; set; }
        public string? FrameSize { get; set; }
        public string? Model { get; set; }
        public bool IsInspected { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? BrandName { get; set; }
        public string? CategoryName { get; set; }
    }
}
