using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Bike_Link.Domain.Models;

public partial class VehicleMedium
{
    [Key]
    public int MediaId { get; set; }

    // FK -> Vehicle
    public int VehicleId { get; set; }

    public string? Type { get; set; }   // image, video
    public string Url { get; set; } = null!;

    // Navigation
    public virtual Vehicle Vehicle { get; set; } = null!;
}
