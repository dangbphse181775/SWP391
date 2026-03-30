using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Domain.Models;

namespace Bike_Link.Application.IService
{
    public interface IAdminVehicleService
    {
        Task<List<AdminPendingVehicleDto>> GetPendingAsync();
        Task<AdminVehicleDetailDto?> GetDetailAsync(int id);
        Task ApproveAsync(int id);
        Task RejectAsync(int id, string note);
        Task<AdminDashboardStatsDto> GetDashboardStatsAsync();
    }
}
