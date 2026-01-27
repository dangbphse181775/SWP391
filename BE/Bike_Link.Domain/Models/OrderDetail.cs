using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    // FK -> Order
    public int OrderId { get; set; }

    // FK -> Vehicle
    public int VehicleId { get; set; }

    public int Quantity { get; set; }
    public decimal Price { get; set; }

    // Navigation
    public virtual Order Order { get; set; } = null!;
    public virtual Vehicle Vehicle { get; set; } = null!;
}
