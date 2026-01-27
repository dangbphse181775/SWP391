using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class VehicleListDto
    {
        public int VehicleId { get; set; }

        public string Name { get; set; } = null!;

        public decimal Price { get; set; }

        public string? Status { get; set; }

        public bool IsInspected { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
