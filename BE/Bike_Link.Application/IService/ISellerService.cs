using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Domain.Models;

namespace Bike_Link.Application.IService
{
    public interface ISellerService
    {
        Task<int> CreateVehicleAsync(CreateVehicleRequest req, int sellerId);
        Task<List<Vehicle>> GetMyVehiclesAsync(int sellerId);
        Task<Vehicle?> GetDetailAsync(int id, int sellerId);
        Task UpdateAsync(int id, UpdateVehicleRequest req, int sellerId);
        Task HideAsync(int id, int sellerId);
    }
}
