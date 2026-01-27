using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Wishlist
{
    public int WishlistId { get; set; }


    public int UserId { get; set; }

    public DateTime? CreatedAt { get; set; }

    // Navigation
    public virtual User User { get; set; } = null!;

    public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
}
