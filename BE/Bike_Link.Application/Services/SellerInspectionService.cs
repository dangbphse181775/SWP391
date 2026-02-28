using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Infrastructure.Persitence.Repository;

namespace Bike_Link.Application.Services
{
    public class SellerInspectionService : ISellerInspectionService
    {
        private readonly IVehicleRepository _vehicleRepo;
        private readonly IInspectionRepository _inspectionRepo;

        public SellerInspectionService(
            IVehicleRepository vehicleRepo,
            IInspectionRepository inspectionRepo)
        {
            _vehicleRepo = vehicleRepo;
            _inspectionRepo = inspectionRepo;
        }

        public async Task<InspectionReportDto?>
            GetInspectionReportAsync(int vehicleId, int sellerId)
        {
            // 1️⃣ Lấy vehicle
            var vehicle = await _vehicleRepo.GetByIdAsync(vehicleId);

            if (vehicle == null)
                return null;

            // 2️⃣ Kiểm tra quyền sở hữu
            if (vehicle.SellerId != sellerId)
                return null;

            // 3️⃣ Lấy report mới nhất
            var report = await _inspectionRepo
                .GetLatestByVehicleIdAsync(vehicleId);

            if (report == null)
                return null;

            // 4️⃣ Map DTO
            return new InspectionReportDto
            {
                VehicleId = vehicle.VehicleId,
                VehicleName = vehicle.Name,
                Status = vehicle.Status ?? "",
                Result = report.Result,
                FrameStatus = report.FrameStatus,
                BrakeStatus = report.BrakeStatus,
                DrivetrainStatus = report.DrivetrainStatus,
                Description = report.Description,
                ReportFileUrl = report.ReportFileUrl,
                CreatedAt = report.CreatedAt
            };
        }
    }
}
