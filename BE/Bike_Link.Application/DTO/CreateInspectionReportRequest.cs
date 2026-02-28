using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class CreateInspectionReportRequest
    {
        public string? FrameStatus { get; set; }
        public string? BrakeStatus { get; set; }
        public string? DrivetrainStatus { get; set; }

        public bool Passed { get; set; }

        public string? Description { get; set; }

        public string? ReportFileUrl { get; set; }
    }
}
