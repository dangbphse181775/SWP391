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
        Task UpdateVehicleAsync(Vehicle v);
        Task<List<Vehicle>> GetBySellerAsync(int sellerId);
        Task<Vehicle?> GetByIdAsync(int id, int sellerId);
        Task HideAsync(int id, int sellerId);
        Task InsertMediaAsync(int vehicleId, string type, string url);
    }
}
