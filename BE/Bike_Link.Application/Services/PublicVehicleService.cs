using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;

namespace Bike_Link.Application.Services
{
    public class PublicVehicleService : IPublicVehicleService
    {
        private readonly IPublicVehicleRepository _repo;

        public PublicVehicleService(IPublicVehicleRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<HomeVehicleDto>> SearchAsync(VehicleSearchOptions options)
        {
            var vehicles = await _repo.SearchAsync(options);

            return vehicles.Select(v => new HomeVehicleDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Price = v.Price,
                ThumbnailUrl = v.ThumbnailUrl,
                BrandName = v.BrandName,
                CategoryName = v.CategoryName,
                Condition = v.Condition,
                FrameSize = v.FrameSize,
                UsageHistory = v.UsageHistory,
                Model = v.Model
            }).ToList();
        }

        public async Task<PublicVehicleDetailDto?> GetDetailAsync(int id)
        {
            var v = await _repo.GetPublicByIdAsync(id);

            if (v == null) return null;

            return new PublicVehicleDetailDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Description = v.Description,
                Price = v.Price,

                Condition = v.Condition,
                FrameSize = v.FrameSize,
                Model = v.Model,

                BrandName = v.Brand?.BrandName,
                CategoryName = v.Category?.CategoryName,

                SellerId = v.SellerId,
                SellerName = v.Seller?.FullName,

                IsInspected = v.IsInspected ?? false,
                CreatedAt = v.CreatedAt ?? DateTime.UtcNow,

                Media = v.VehicleMedia.Select(m => new VehicleMediaDto
                {
                    MediaId = m.MediaId,
                    Type = m.Type!,
                    Url = m.Url
                }).ToList()
            };
        }
    }
}
