using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Bike_Link.Infrastructure.Persitence.Repository;
using Bike_Link.Domain.Models;


namespace Bike_Link.Application.Services
{
    public class SellerService : ISellerService
    {
        private readonly IVehicleRepository _repo;
        private readonly Cloudinary _cloudinary;

        public SellerService(IVehicleRepository repo, Cloudinary cloudinary)
        {
            _repo = repo;
            _cloudinary = cloudinary;
        }

        public async Task<int> CreateVehicleAsync(CreateVehicleRequest req, int sellerId)
        {
            var vehicle = new Vehicle
            {
                SellerId = sellerId,
                Name = req.Name,
                Description = req.Description,
                Price = req.Price,
                Condition = req.Condition,
                FrameSize = req.FrameSize,
                UsageHistory = req.UsageHistory,
                Model = req.Model,
                BrandId = req.BrandId,
                CategoryId = req.CategoryId
            };

            int vehicleId = await _repo.InsertVehicleAsync(vehicle);

            // 2. Upload images
            if (req.Images != null)
            {
                foreach (var file in req.Images)
                {
                    using var stream = file.OpenReadStream();
                    var upload = await _cloudinary.UploadAsync(new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = "vehicles/images"
                    });

                    await _repo.InsertMediaAsync(vehicleId, "image", upload.SecureUrl.ToString());
                }
            }

            // 3. Upload videos
            if (req.Videos != null)
            {
                foreach (var file in req.Videos)
                {
                    using var stream = file.OpenReadStream();
                    var upload = await _cloudinary.UploadAsync(new VideoUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = "vehicles/videos"
                    });

                    await _repo.InsertMediaAsync(vehicleId, "video", upload.SecureUrl.ToString());
                }
            }

            return vehicleId;
        }

        public async Task<List<Vehicle>> GetMyVehiclesAsync(int sellerId)
    => await _repo.GetBySellerAsync(sellerId);

        public async Task<Vehicle?> GetDetailAsync(int id, int sellerId)
            => await _repo.GetByIdAsync(id, sellerId);

        public async Task UpdateAsync(int id, UpdateVehicleRequest req, int sellerId)
        {
            var v = new Vehicle
            {
                VehicleId = id,
                SellerId = sellerId,
                Name = req.Name,
                Description = req.Description,
                Price = req.Price,
                Condition = req.Condition,
                FrameSize = req.FrameSize,
                UsageHistory = req.UsageHistory,
                Model = req.Model,
                BrandId = req.BrandId,
                CategoryId = req.CategoryId
            };

            await _repo.UpdateVehicleAsync(v);
        }

        public async Task HideAsync(int id, int sellerId)
            => await _repo.HideAsync(id, sellerId);
    }
}
