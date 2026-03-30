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
    public class InspectorService : IInspectorService
    {
        private readonly IInspectorRepository _repo;

        public InspectorService(IInspectorRepository repo)
        {
            _repo = repo;
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
    }
}
