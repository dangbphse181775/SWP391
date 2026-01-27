using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class VehicleDetailDto
    {
        public int VehicleId { get; set; }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public decimal Price { get; set; }

        public string? Condition { get; set; }
        public string? FrameSize { get; set; }
        public string? UsageHistory { get; set; }
        public string? Model { get; set; }

        public int? BrandId { get; set; }
        public int? CategoryId { get; set; }

        public string? Status { get; set; }
        public bool IsInspected { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<VehicleMediaDto> Media { get; set; } = new();
    }

    public class VehicleMediaDto
    {
        public int MediaId { get; set; }
        public string Type { get; set; } = null!; // image / video
        public string Url { get; set; } = null!;
    }
}
