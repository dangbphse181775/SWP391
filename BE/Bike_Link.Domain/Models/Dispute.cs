using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Dispute
{
    public int DisputeId { get; set; }

    // FK -> Order
    public int OrderId { get; set; }

    // FK -> User (người mở tranh chấp)
    public int OpenedByUserId { get; set; }

    public string? Description { get; set; }
    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    // Navigation
    public virtual Order Order { get; set; } = null!;
    public virtual User OpenedByUser { get; set; } = null!;
}
