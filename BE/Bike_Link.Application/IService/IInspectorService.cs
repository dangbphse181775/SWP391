using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Domain.Models;

namespace Bike_Link.Application.IService
{
    public interface IInspectorService
    {
        Task<List<InspectorPendingVehicleDto>> GetPendingAsync();

        Task CreateReportAsync(
            int vehicleId,
            int inspectorUserId,
            CreateInspectionReportRequest req);

        Task<VehicleDetailDto?> GetVehicleDetailForInspectionAsync(int vehicleId);
    }
}
