using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class AdminVehicleRepository : IAdminVehicleRepository
    {
        private readonly NpgsqlDataSource _dataSource;
        private readonly BikeLinkContext _context;

        public AdminVehicleRepository(NpgsqlDataSource dataSource, BikeLinkContext context)
        {
            _dataSource = dataSource;
            _context = context;
        }

        public async Task<List<Vehicle>> GetPendingForAdminAsync()
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT 
    v.""VehicleId"",
    v.""Name"",
    v.""Price"",
    v.""CreatedAt"",
    v.""SellerId"",
    u.""FullName"",

    (
        SELECT vm.""Url""
        FROM ""VehicleMedia"" vm
        WHERE vm.""VehicleId"" = v.""VehicleId""
          AND vm.""Type""='image'
        ORDER BY vm.""MediaId""
        LIMIT 1
    ) AS Thumb

FROM ""Vehicles"" v
JOIN ""Users"" u ON v.""SellerId"" = u.""UserId""

WHERE v.""Status""='pending_admin'
ORDER BY v.""CreatedAt"" DESC
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
                    SellerId = rd.GetInt32(4),

                    Seller = new User
                    {
                        FullName = rd.GetString(5)
                    },

                    ThumbnailUrl = rd.IsDBNull(6) ? null : rd.GetString(6)
                });
            }

            return list;
        }

        public async Task<Vehicle?> GetByIdForAdminAsync(int id)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT 
 v.""VehicleId"",
 v.""Name"",
 v.""Description"",
 v.""Price"",
 v.""Condition"",
 v.""FrameSize"",
 v.""UsageHistory"",
 v.""Model"",
 v.""AdminNote"",
 v.""CreatedAt"",
 u.""FullName"",
 u.""Email"",
 b.""BrandName"",
 c.""CategoryName"",
 v.""SellerId""

FROM ""Vehicles"" v
JOIN ""Users"" u ON v.""SellerId""=u.""UserId""
LEFT JOIN ""Brands"" b ON v.""BrandId""=b.""BrandId""
LEFT JOIN ""Categories"" c ON v.""CategoryId""=c.""CategoryId""

WHERE v.""VehicleId""=@id
", conn);

            cmd.Parameters.AddWithValue("id", id);

            await using var rd = await cmd.ExecuteReaderAsync();

            if (!await rd.ReadAsync()) return null;

            var v = new Vehicle
            {
                VehicleId = rd.GetInt32(0),
                Name = rd.GetString(1),
                Description = rd.IsDBNull(2) ? null : rd.GetString(2),
                Price = rd.GetDecimal(3),
                Condition = rd.IsDBNull(4) ? null : rd.GetString(4),
                FrameSize = rd.IsDBNull(5) ? null : rd.GetString(5),
                UsageHistory = rd.IsDBNull(6) ? null : rd.GetString(6),
                Model = rd.IsDBNull(7) ? null : rd.GetString(7),
                AdminNote = rd.IsDBNull(8) ? null : rd.GetString(8),
                CreatedAt = rd.GetDateTime(9),

                Seller = new User
                {
                    FullName = rd.GetString(10),
                    Email = rd.GetString(11)
                },

                Brand = rd.IsDBNull(12) ? null : new Brand
                {
                    BrandName = rd.GetString(12)
                },

                Category = rd.IsDBNull(13) ? null : new Category
                {
                    CategoryName = rd.GetString(13)
                }
            };

            v.VehicleMedia = await GetMediaAsync(id);

            return v;
        }

        private async Task<List<VehicleMedium>> GetMediaAsync(int vehicleId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT ""Type"", ""Url""
FROM ""VehicleMedia""
WHERE ""VehicleId"" = @id
ORDER BY ""MediaId""
", conn);

            cmd.Parameters.AddWithValue("id", vehicleId);

            var list = new List<VehicleMedium>();

            await using var rd = await cmd.ExecuteReaderAsync();

            while (await rd.ReadAsync())
            {
                list.Add(new VehicleMedium
                {
                    Type = rd.GetString(0),
                    Url = rd.GetString(1)
                });
            }

            return list;
        }


        public async Task ApproveAsync(int id)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
UPDATE ""Vehicles""
SET ""Status""='pending_inspection',
    ""AdminNote""=NULL
WHERE ""VehicleId""=@id
", conn);

            cmd.Parameters.AddWithValue("id", id);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task RejectAsync(int id, string note)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
UPDATE ""Vehicles""
SET ""Status""='rejected',
    ""AdminNote""=@note
WHERE ""VehicleId""=@id
", conn);

            cmd.Parameters.AddWithValue("id", id);
            cmd.Parameters.AddWithValue("note", note);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<(int totalUsers,
                          int totalOrders,
                          int totalCompletedOrders,
                          int totalProcessingOrders,
                          int totalSoldVehicles,
                          int totalActiveVehicles,
                          int totalPendingVehicles,
                          int totalPendingInspectionVehicles,
                          int totalRejectedVehicles,
                          decimal totalRevenueCompletedOrders)> GetDashboardStatsAsync()
        {
            int totalUsers = await _context.Users.CountAsync();

            int totalOrders = await _context.Orders.CountAsync();
            int totalCompletedOrders = await _context.Orders.CountAsync(o => o.Status == "completed");
            int totalProcessingOrders = await _context.Orders.CountAsync(o => o.Status == "processing");

            int totalSoldVehicles = await _context.Vehicles.CountAsync(v => v.Status == "sold");
            int totalActiveVehicles = await _context.Vehicles.CountAsync(v => v.Status == "active");
            int totalPendingVehicles = await _context.Vehicles.CountAsync(v => v.Status == "pending_admin");
            int totalPendingInspectionVehicles = await _context.Vehicles.CountAsync(v => v.Status == "pending_inspection");
            int totalRejectedVehicles = await _context.Vehicles.CountAsync(v => v.Status == "rejected");

            decimal totalRevenueCompletedOrders = await _context.Orders
                .Where(o => o.Status == "completed")
                .SumAsync(o => (decimal?)o.Amount) ?? 0m;

            return (
                totalUsers,
                totalOrders,
                totalCompletedOrders,
                totalProcessingOrders,
                totalSoldVehicles,
                totalActiveVehicles,
                totalPendingVehicles,
                totalPendingInspectionVehicles,
                totalRejectedVehicles,
                totalRevenueCompletedOrders
            );
        }
    }
}
