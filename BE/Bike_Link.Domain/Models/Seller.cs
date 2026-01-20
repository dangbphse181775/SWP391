using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Seller
{
    public int UserId { get; set; }

    public string? ShopName { get; set; }

    public string? Description { get; set; }

    public decimal? RatingAvg { get; set; }

    public int? TotalSales { get; set; }

    public virtual User User { get; set; } = null!;
}
