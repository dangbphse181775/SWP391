using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class UpdateVehicleRequest
    {
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal Price { get; set; }
        public string Condition { get; set; } = "";
        public string FrameSize { get; set; } = "";
        public string UsageHistory { get; set; } = "";
        public string Model { get; set; } = "";
        public int BrandId { get; set; }
        public int CategoryId { get; set; }
    }
}
