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
        Task<CreateVehicleResultDto> CreateVehicleAsync(CreateVehicleRequest req, int userId);
        Task<List<VehicleListDto>> GetMyVehiclesAsync(int userId);
        Task<VehicleDetailDto?> GetDetailAsync(int id, int userId);
        Task UpdateAsync(int id, UpdateVehicleRequest req, int userId);
        Task HideAsync(int id, int userId);
        Task<RejectedVehicleDto?> GetRejectReasonAsync(int vehicleId, int userId);
        Task<FeePreviewDto> GetFeePreviewAsync(decimal vehiclePrice);
    }
}
