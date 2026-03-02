using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository
{
    public interface IInspectorRepository
    {
        Task<List<Vehicle>> GetPendingInspectionAsync();
        Task<Vehicle?> GetVehicleAsync(int vehicleId);
        Task CreateReportAsync(InspectionReport report);
        Task UpdateVehicleStatusAsync(int vehicleId, string status);
        
    }
}
