using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Domain.Models
{
    public partial class CartItem
    {
        public int CartItemId { get; set; }

        public int CartId { get; set; }

        public int VehicleId { get; set; }

        public int Quantity { get; set; } = 1;

        public DateTime CreatedAt { get; set; }

        // Navigation
        public virtual Cart Cart { get; set; } = null!;

        public virtual Vehicle Vehicle { get; set; } = null!;
    }
}
