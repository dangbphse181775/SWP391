using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Bike_Link.Domain.Models;

public partial class Inspector
{
    [Key]
    public int UserId { get; set; }

    public string? CertificateInfo { get; set; }

    // Navigation
    public virtual User User { get; set; } = null!;
    public virtual ICollection<InspectionReport> InspectionReports { get; set; } = new List<InspectionReport>();
}
