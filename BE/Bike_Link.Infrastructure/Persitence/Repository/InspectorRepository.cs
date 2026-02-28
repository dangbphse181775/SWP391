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
    public class InspectorRepository : IInspectorRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public InspectorRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<List<Vehicle>> GetPendingInspectionAsync()
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT v.""VehicleId"",
       v.""Name"",
       v.""Price"",
       v.""CreatedAt"",
       (
           SELECT vm.""Url""
           FROM ""VehicleMedia"" vm
           WHERE vm.""VehicleId"" = v.""VehicleId""
             AND vm.""Type"" = 'image'
           ORDER BY vm.""MediaId""
           LIMIT 1
       ) AS ""ThumbnailUrl""
FROM ""Vehicles"" v
WHERE v.""Status"" = 'pending_inspection'
ORDER BY v.""CreatedAt""
", conn);

            var list = new List<Vehicle>();

            await using var rd = await cmd.ExecuteReaderAsync();

            while (await rd.ReadAsync())
            {
                list.Add(new Vehicle
                {
                    VehicleId = rd.GetInt32(0),
                    Name = rd.GetString(1),
                    Price = rd.GetDecimal(2),
                    CreatedAt = rd.GetDateTime(3),

                    // field này là [NotMapped]
                    ThumbnailUrl = rd.IsDBNull(4) ? null : rd.GetString(4)
                });
            }

            return list;
        }

        public async Task<Vehicle?> GetVehicleAsync(int vehicleId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT ""VehicleId"", ""Status""
FROM ""Vehicles""
WHERE ""VehicleId"" = @id
", conn);

            cmd.Parameters.AddWithValue("id", vehicleId);

            await using var rd = await cmd.ExecuteReaderAsync();

            if (!await rd.ReadAsync())
                return null;

            return new Vehicle
            {
                VehicleId = rd.GetInt32(0),
                Status = rd.GetString(1)
            };
        }

        public async Task CreateReportAsync(InspectionReport report)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
INSERT INTO ""InspectionReports""
(""VehicleId"", ""InspectorId"",
 ""FrameStatus"", ""BrakeStatus"",
 ""DrivetrainStatus"", ""Result"",
 ""Description"", ""ReportFileUrl"", ""CreatedAt"")
VALUES
(@vid, @iid,
 @frame, @brake,
 @drive, @result,
 @desc, @file, NOW())
", conn);

            cmd.Parameters.AddWithValue("vid", report.VehicleId);
            cmd.Parameters.AddWithValue("iid", report.InspectorId);
            cmd.Parameters.AddWithValue("frame", report.FrameStatus ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("brake", report.BrakeStatus ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("drive", report.DrivetrainStatus ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("result", report.Result ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("desc", report.Description ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("file", report.ReportFileUrl ?? (object)DBNull.Value);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task UpdateVehicleStatusAsync(int vehicleId, string status)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
UPDATE ""Vehicles""
SET ""Status"" = @status,
    ""IsInspected"" = true,
    ""UpdatedAt"" = NOW()
WHERE ""VehicleId"" = @id
", conn);

            cmd.Parameters.AddWithValue("status", status);
            cmd.Parameters.AddWithValue("id", vehicleId);

            await cmd.ExecuteNonQueryAsync();
        }       
    }
}