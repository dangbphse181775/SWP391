using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class AdminPendingVehicleDto
    {
        public int VehicleId { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public string SellerName { get; set; } = null!;
        public string? ThumbnailUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
