using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class VehicleMedium
{
    public int MediaId { get; set; }

    public int? VehicleId { get; set; }

    public string? Type { get; set; }

    public string Url { get; set; } = null!;

    public virtual Vehicle? Vehicle { get; set; }
}
