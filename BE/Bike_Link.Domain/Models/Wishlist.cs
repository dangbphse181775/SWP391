using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Wishlist
{
    public int WishlistId { get; set; }

    public int? BuyerId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? Buyer { get; set; }

    public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
}
