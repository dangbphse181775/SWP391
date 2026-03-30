using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Npgsql;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class InspectionRepository : IInspectionRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public InspectionRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<(Vehicle, InspectionReport)?>
            GetInspectionReportAsync(int vehicleId, int sellerId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT 
    v.""VehicleId"",
    v.""Name"",
    v.""Status"",
    r.""FrameStatus"",
    r.""BrakeStatus"",
    r.""DrivetrainStatus"",
    r.""Result"",
    r.""Description"",
    r.""ReportFileUrl"",
    r.""CreatedAt""
FROM ""Vehicles"" v
JOIN ""InspectionReports"" r 
    ON v.""VehicleId"" = r.""VehicleId""
WHERE v.""VehicleId"" = @vid
  AND v.""SellerId"" = @sid
ORDER BY r.""CreatedAt"" DESC
LIMIT 1
", conn);

            cmd.Parameters.AddWithValue("vid", vehicleId);
            cmd.Parameters.AddWithValue("sid", sellerId);

            await using var rd = await cmd.ExecuteReaderAsync();

            if (!await rd.ReadAsync())
                return null;

            var vehicle = new Vehicle
            {
                VehicleId = rd.GetInt32(0),
                Name = rd.GetString(1),
                Status = rd.IsDBNull(2) ? null : rd.GetString(2)
            };

            var report = new InspectionReport
            {
                FrameStatus = rd.IsDBNull(3) ? null : rd.GetString(3),
                BrakeStatus = rd.IsDBNull(4) ? null : rd.GetString(4),
                DrivetrainStatus = rd.IsDBNull(5) ? null : rd.GetString(5),
                Result = rd.IsDBNull(6) ? null : rd.GetString(6),
                Description = rd.IsDBNull(7) ? null : rd.GetString(7),
                ReportFileUrl = rd.IsDBNull(8) ? null : rd.GetString(8),
                CreatedAt = rd.IsDBNull(9) ? null : rd.GetDateTime(9)
            };

            return (vehicle, report);
        }

        public async Task<InspectionReport?>
            GetLatestByVehicleIdAsync(int vehicleId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT 
    ""ReportId"",
    ""VehicleId"",
    ""InspectorId"",
    ""FrameStatus"",
    ""BrakeStatus"",
    ""DrivetrainStatus"",
    ""Result"",
    ""Description"",
    ""ReportFileUrl"",
    ""CreatedAt""
FROM ""InspectionReports""
WHERE ""VehicleId"" = @vid
ORDER BY ""CreatedAt"" DESC
LIMIT 1
", conn);

            cmd.Parameters.AddWithValue("vid", vehicleId);

            await using var rd = await cmd.ExecuteReaderAsync();

            if (!await rd.ReadAsync())
                return null;

            return new InspectionReport
            {
                ReportId = rd.GetInt32(0),
                VehicleId = rd.GetInt32(1),
                InspectorId = rd.GetInt32(2),
                FrameStatus = rd.IsDBNull(3) ? null : rd.GetString(3),
                BrakeStatus = rd.IsDBNull(4) ? null : rd.GetString(4),
                DrivetrainStatus = rd.IsDBNull(5) ? null : rd.GetString(5),
                Result = rd.IsDBNull(6) ? null : rd.GetString(6),
                Description = rd.IsDBNull(7) ? null : rd.GetString(7),
                ReportFileUrl = rd.IsDBNull(8) ? null : rd.GetString(8),
                CreatedAt = rd.IsDBNull(9) ? null : rd.GetDateTime(9)
            };
        }
    }
}
