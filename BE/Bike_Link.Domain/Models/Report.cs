using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;
public partial class Report
{
    public int ReportId { get; set; }

    // FK -> User (người gửi báo cáo)
    public int ReporterId { get; set; }

    // Loại đối tượng bị report: "vehicle", "user", "order", ...
    public string TargetType { get; set; } = null!;

    // Id của đối tượng bị report
    public int TargetId { get; set; }

    public string? Reason { get; set; }
    public string? Status { get; set; }          // pending, resolved, rejected

    public DateTime? CreatedAt { get; set; }

    // Navigation
    public virtual User Reporter { get; set; } = null!;
}
