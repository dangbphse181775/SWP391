using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Vehicle
{
    public int VehicleId { get; set; }

    public int SellerId { get; set; }

    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? Condition { get; set; }
    public string? FrameSize { get; set; }
    public string? UsageHistory { get; set; }
    public string? Model { get; set; }

    public int? BrandId { get; set; }
    public int? CategoryId { get; set; }

    public string? Status { get; set; }        // pending_approval, active, hidden, sold...
    public bool? IsInspected { get; set; }

    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public virtual Brand? Brand { get; set; }
    public virtual Category? Category { get; set; }

    public virtual User Seller { get; set; } = null!;

    public virtual ICollection<InspectionReport> InspectionReports { get; set; } = new List<InspectionReport>();
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    public virtual ICollection<VehicleMedium> VehicleMedia { get; set; } = new List<VehicleMedium>();
    public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
}
