using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Report
{
    public int ReportId { get; set; }

    public int? ReporterId { get; set; }

    public string? TargetType { get; set; }

    public int? TargetId { get; set; }

    public string? Reason { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? Reporter { get; set; }
}
