using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class HomeVehicleDto
    {
        public int VehicleId { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? BrandName { get; set; }
        public string? CategoryName { get; set; }
        public string? Condition { get; set; }
        public string? FrameSize { get; set; }
        public string? UsageHistory { get; set; }
        public string? Model { get; set; }
    }
}
