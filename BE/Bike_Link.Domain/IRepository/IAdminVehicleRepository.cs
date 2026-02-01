using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository
{
    public interface IAdminVehicleRepository
    {
        Task<List<Vehicle>> GetPendingForAdminAsync();
        Task<Vehicle?> GetByIdForAdminAsync(int id);
        Task ApproveAsync(int id);
        Task RejectAsync(int id, string note);
    }
}
