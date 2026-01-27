using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.Models;


namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public interface IVehicleRepository
    {
        Task<int> InsertVehicleAsync(Vehicle vehicle);
        Task UpdateVehicleAsync(Vehicle vehicle);
        Task<List<Vehicle>> GetBySellerAsync(int userId);
        Task<Vehicle?> GetByIdAsync(int id, int userId);
        Task HideAsync(int id, int userId);
        Task InsertMediaAsync(int vehicleId, string type, string url);
    }
}
