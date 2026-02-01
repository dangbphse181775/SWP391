using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;

namespace Bike_Link.Application.Services
{
    public class AdminVehicleService : IAdminVehicleService
    {
        private readonly IAdminVehicleRepository _repo;

        public AdminVehicleService(IAdminVehicleRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<AdminPendingVehicleDto>> GetPendingAsync()
        {
            var list = await _repo.GetPendingForAdminAsync();

            return list.Select(v => new AdminPendingVehicleDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Price = v.Price,
                SellerName = v.Seller!.FullName!,
                ThumbnailUrl = v.ThumbnailUrl,
                CreatedAt = v.CreatedAt!.Value
            }).ToList();
        }

        public async Task<AdminVehicleDetailDto?> GetDetailAsync(int id)
        {
            var v = await _repo.GetByIdForAdminAsync(id);

            if (v == null) return null;

            return new AdminVehicleDetailDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Description = v.Description,
                Price = v.Price,
                Condition = v.Condition,
                FrameSize = v.FrameSize,
                UsageHistory = v.UsageHistory,
                Model = v.Model,

                SellerName = v.Seller!.FullName!,
                SellerEmail = v.Seller.Email!,

                BrandName = v.Brand?.BrandName,
                CategoryName = v.Category?.CategoryName,

                Images = v.VehicleMedia.Select(x => x.Url).ToList(),

                AdminNote = v.AdminNote,

                CreatedAt = v.CreatedAt!.Value
            };
        }

        public Task ApproveAsync(int id)
            => _repo.ApproveAsync(id);

        public Task RejectAsync(int id, string note)
            => _repo.RejectAsync(id, note);
    }
}
