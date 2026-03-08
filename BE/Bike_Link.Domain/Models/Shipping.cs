using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Domain.Models
{
    public partial class Shipping
    {
        public int ShippingId { get; set; }

        public int OrderId { get; set; }

        public string RecipientName { get; set; } = null!;

        public string RecipientPhone { get; set; } = null!;

        public string ShippingAddress { get; set; } = null!;

        public string? Note { get; set; }

        public DateTime? CreatedAt { get; set; }

        // Navigation
        public virtual Order Order { get; set; } = null!;
    }
}
