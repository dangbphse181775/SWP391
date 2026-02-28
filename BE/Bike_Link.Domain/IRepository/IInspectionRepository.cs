using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository
{
    public interface IInspectionRepository
    {
        Task<(Vehicle vehicle, InspectionReport report)?>
            GetInspectionReportAsync(int vehicleId, int sellerId);

        Task<InspectionReport?> GetLatestByVehicleIdAsync(int vehicleId);
    }
}
