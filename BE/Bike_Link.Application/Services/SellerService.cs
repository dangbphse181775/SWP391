using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Bike_Link.Infrastructure.Persitence.Repository;

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

        public async Task<int> CreateVehicleAsync(CreateVehicleRequest req, int userId)
        {
            var vehicle = new Vehicle
            {
                SellerId = userId,
                Name = req.Name,
                Description = req.Description,
                Price = req.Price,
                Condition = req.Condition,
                FrameSize = req.FrameSize,
                UsageHistory = req.UsageHistory,
                Model = req.Model,
                BrandId = req.BrandId,
                CategoryId = req.CategoryId,
                Status = "pending_approval",
                CreatedAt = DateTime.UtcNow
            };

            int vehicleId = await _repo.InsertVehicleAsync(vehicle);

            // Upload images
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

            // Upload videos
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

        public async Task<List<VehicleListDto>> GetMyVehiclesAsync(int userId)
        {
            var vehicles = await _repo.GetBySellerAsync(userId);

            return vehicles.Select(v => new VehicleListDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Price = v.Price,
                Status = v.Status,
                IsInspected = v.IsInspected ?? false,
                CreatedAt = v.CreatedAt ?? DateTime.UtcNow
            }).ToList();
        }

        public async Task<VehicleDetailDto?> GetDetailAsync(int id, int userId)
        {
            var v = await _repo.GetByIdAsync(id, userId);
            if (v == null) return null;

            return new VehicleDetailDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Description = v.Description,
                Price = v.Price,
                Condition = v.Condition,
                FrameSize = v.FrameSize,
                UsageHistory = v.UsageHistory,
                Model = v.Model,
                BrandId = v.BrandId,
                CategoryId = v.CategoryId,
                Status = v.Status,
                IsInspected = v.IsInspected ?? false,
                CreatedAt = v.CreatedAt ?? DateTime.UtcNow,
                UpdatedAt = v.UpdatedAt,
                Media = v.VehicleMedia.Select(m => new VehicleMediaDto
                {
                    MediaId = m.MediaId,
                    Type = m.Type ?? "image",
                    Url = m.Url
                }).ToList()
            };
        }

        public async Task UpdateAsync(int id, UpdateVehicleRequest req, int userId)
        {
            var v = new Vehicle
            {
                VehicleId = id,
                SellerId = userId,
                Name = req.Name,
                Description = req.Description,
                Price = req.Price,
                Condition = req.Condition,
                FrameSize = req.FrameSize,
                UsageHistory = req.UsageHistory,
                Model = req.Model,
                BrandId = req.BrandId,
                CategoryId = req.CategoryId,
                UpdatedAt = DateTime.UtcNow
            };

            await _repo.UpdateVehicleAsync(v);
        }

        public async Task HideAsync(int id, int userId)
        {
            await _repo.HideAsync(id, userId);
        }
    }
}
