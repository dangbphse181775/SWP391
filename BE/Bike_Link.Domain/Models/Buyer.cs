using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Buyer
{
    public int UserId { get; set; }

    public decimal? RatingAvg { get; set; }

    public int? TotalPurchases { get; set; }

    public virtual User User { get; set; } = null!;
}
