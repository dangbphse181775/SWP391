using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Dispute
{
    public int DisputeId { get; set; }

    public int? OrderId { get; set; }

    public int? OpenedBy { get; set; }

    public string? Description { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? OpenedByNavigation { get; set; }

    public virtual Order? Order { get; set; }
}
