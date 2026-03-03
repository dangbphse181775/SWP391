using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Bike_Link.Infrastructure.Persitence.Repository;

namespace Bike_Link.Application.Services
{
    public class InspectorService : IInspectorService
    {
        private readonly IInspectorRepository _repo;
        private readonly IVehicleRepository _vehicleRepo;

        public InspectorService(IInspectorRepository repo, IVehicleRepository vehicleRepo)
        {
            _repo = repo;
            _vehicleRepo = vehicleRepo;
        }

        public async Task<List<InspectorPendingVehicleDto>> GetPendingAsync()
        {
            var vehicles = await _repo.GetPendingInspectionAsync();

            return vehicles.Select(v => new InspectorPendingVehicleDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Price = v.Price,
                CreatedAt = v.CreatedAt ?? DateTime.UtcNow,
                ThumbnailUrl = v.ThumbnailUrl
            }).ToList();
        }

        public async Task CreateReportAsync(
            int vehicleId,
            int inspectorUserId,
            CreateInspectionReportRequest req)
        {
            var vehicle = await _repo.GetVehicleAsync(vehicleId);

            if (vehicle == null)
                throw new Exception("Không tìm thấy xe");

            if (vehicle.Status != "pending_inspection")
                throw new Exception("Xe không ở trạng thái chờ kiểm định");

            var report = new InspectionReport
            {
                VehicleId = vehicleId,
                InspectorId = inspectorUserId,
                FrameStatus = req.FrameStatus,
                BrakeStatus = req.BrakeStatus,
                DrivetrainStatus = req.DrivetrainStatus,
                Result = req.Passed ? "passed" : "failed",
                Description = req.Description,
                ReportFileUrl = req.ReportFileUrl
            };

            await _repo.CreateReportAsync(report);

            var newStatus = req.Passed
                ? "active"
                : "failed_inspection";

            await _repo.UpdateVehicleStatusAsync(vehicleId, newStatus);
        }

        public async Task<VehicleDetailDto?> GetVehicleDetailForInspectionAsync(int vehicleId)
        {
            var vehicle = await _vehicleRepo.GetByIdAsync(vehicleId);

            if (vehicle == null)
                return null;

            // Inspector chỉ xem xe đang chờ kiểm định
            if (vehicle.Status != "pending_inspection")
                return null;

            var media = await _vehicleRepo.GetMediaAsync(vehicleId);

            var seller = await _vehicleRepo.GetSellerAsync(vehicle.SellerId);

            return new VehicleDetailDto
            {
                VehicleId = vehicle.VehicleId,
                Name = vehicle.Name,
                Description = vehicle.Description,
                Price = vehicle.Price,
                Condition = vehicle.Condition,
                FrameSize = vehicle.FrameSize,
                UsageHistory = vehicle.UsageHistory,
                Model = vehicle.Model,
                BrandId = vehicle.BrandId,
                CategoryId = vehicle.CategoryId,
                Status = vehicle.Status,
                IsInspected = vehicle.IsInspected ?? false,
                AdminNote = vehicle.AdminNote,
                CreatedAt = vehicle.CreatedAt ?? DateTime.UtcNow,
                UpdatedAt = vehicle.UpdatedAt,
                Seller = seller == null ? null : new SellerInfoDto
                {
                    SellerId = seller.UserId,
                    FullName = seller.FullName,
                    Phone = seller.Phone,
                    Email = seller.Email
                },
                Media = media.Select(m => new VehicleMediaDto
                {
                    MediaId = m.MediaId,
                    Type = m.Type ?? "image",
                    Url = m.Url
                }).ToList()
            };
        }
    }
}
