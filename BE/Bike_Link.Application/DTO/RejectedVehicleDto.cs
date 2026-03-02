using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class RejectedVehicleDto
    {
        public int VehicleId { get; set; }
        public string Name { get; set; } = null!;
        public string? AdminNote { get; set; }
    }
}
