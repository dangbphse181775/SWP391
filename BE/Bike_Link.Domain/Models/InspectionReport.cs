using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class InspectionReport
{
    public int ReportId { get; set; }

    public int VehicleId { get; set; }

    // FK -> Inspector.UserId
    public int InspectorId { get; set; }

    public string? FrameStatus { get; set; }
    public string? BrakeStatus { get; set; }
    public string? DrivetrainStatus { get; set; }

    public string? Result { get; set; }
    public string? Description { get; set; }
    public string? ReportFileUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    // Navigation
    public virtual Inspector Inspector { get; set; } = null!;
    public virtual Vehicle Vehicle { get; set; } = null!;
}
