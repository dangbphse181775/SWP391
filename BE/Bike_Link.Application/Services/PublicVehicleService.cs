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
    }
}
