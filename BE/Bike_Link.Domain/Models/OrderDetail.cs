using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int? OrderId { get; set; }

    public int? VehicleId { get; set; }

    public int? Quantity { get; set; }

    public decimal? Price { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Vehicle? Vehicle { get; set; }
}
