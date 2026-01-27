using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class WishlistItem
{
    public int WishlistId { get; set; }
    public int VehicleId { get; set; }

    public DateTime? CreatedAt { get; set; }

    // Navigation
    public virtual Wishlist Wishlist { get; set; } = null!;
    public virtual Vehicle Vehicle { get; set; } = null!;
}
