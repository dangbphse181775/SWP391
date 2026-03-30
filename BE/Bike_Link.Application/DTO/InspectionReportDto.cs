using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class InspectionReportDto
    {
        public int VehicleId { get; set; }

        public string VehicleName { get; set; } = null!;

        public string Status { get; set; } = null!; // active / failed_inspection

        public string? Result { get; set; }  // passed / failed

        public string? FrameStatus { get; set; }
        public string? BrakeStatus { get; set; }
        public string? DrivetrainStatus { get; set; }

        public string? Description { get; set; }

        public string? ReportFileUrl { get; set; }

        public DateTime? CreatedAt { get; set; }
    }
}
