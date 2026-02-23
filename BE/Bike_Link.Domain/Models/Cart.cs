using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Domain.Models
{
    public partial class Cart
    {
        public int CartId { get; set; }

        public int UserId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public virtual User User { get; set; } = null!;

        public virtual ICollection<CartItem> CartItems { get; set; }
            = new List<CartItem>();
    }
}
