using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class AdminVehicleDetailDto
    {
        public int VehicleId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Condition { get; set; }
        public string? FrameSize { get; set; }
        public string? UsageHistory { get; set; }
        public string? Model { get; set; }
        public string SellerName { get; set; } = null!;
        public string SellerEmail { get; set; } = null!;
        public string? BrandName { get; set; }
        public string? CategoryName { get; set; }
        public List<string> Images { get; set; } = new();
        public string? AdminNote { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
