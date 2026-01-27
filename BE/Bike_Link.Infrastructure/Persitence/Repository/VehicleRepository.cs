using Bike_Link.Domain.Models;
using Npgsql;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class VehicleRepository : IVehicleRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public VehicleRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<int> InsertVehicleAsync(Vehicle v)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
INSERT INTO ""Vehicles"" 
(
    ""SellerId"", ""Name"", ""Description"", ""Price"", ""Condition"", 
    ""FrameSize"", ""UsageHistory"", ""Model"", ""BrandId"", 
    ""CategoryId"", ""Status"", ""CreatedAt""
)
VALUES
(@seller, @name, @desc, @price, @cond, @frame, @usage, @model, @brand, @cat, @status, NOW())
RETURNING ""VehicleId"";
", conn);

            cmd.Parameters.AddWithValue("seller", v.SellerId);
            cmd.Parameters.AddWithValue("name", v.Name);
            cmd.Parameters.AddWithValue("desc", (object?)v.Description ?? DBNull.Value);
            cmd.Parameters.AddWithValue("price", v.Price);
            cmd.Parameters.AddWithValue("cond", (object?)v.Condition ?? DBNull.Value);
            cmd.Parameters.AddWithValue("frame", (object?)v.FrameSize ?? DBNull.Value);
            cmd.Parameters.AddWithValue("usage", (object?)v.UsageHistory ?? DBNull.Value);
            cmd.Parameters.AddWithValue("model", (object?)v.Model ?? DBNull.Value);
            cmd.Parameters.AddWithValue("brand", (object?)v.BrandId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("cat", (object?)v.CategoryId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("status", v.Status ?? "pending_approval");

            return (int)(await cmd.ExecuteScalarAsync())!;
        }

        public async Task<List<Vehicle>> GetBySellerAsync(int userId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
SELECT 
    ""VehicleId"", 
    ""Name"", 
    ""Price"", 
    ""Status"", 
    ""CreatedAt"", 
    ""IsInspected""
FROM  ""Vehicles""
WHERE ""SellerId"" = @uid
ORDER BY ""CreatedAt"" DESC
", conn);

            cmd.Parameters.AddWithValue("uid", userId);

            var list = new List<Vehicle>();
            await using var rd = await cmd.ExecuteReaderAsync();
            while (await rd.ReadAsync())
            {
                list.Add(new Vehicle
                {
                    VehicleId = rd.GetInt32(0),
                    Name = rd.GetString(1),
                    Price = rd.GetDecimal(2),
                    Status = rd.IsDBNull(3) ? null : rd.GetString(3),
                    CreatedAt = rd.IsDBNull(4) ? null : rd.GetDateTime(4),
                    IsInspected = rd.IsDBNull(5) ? null : rd.GetBoolean(5)
                });
            }

            return list;
        }

        public async Task<Vehicle?> GetByIdAsync(int id, int userId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
SELECT 
    ""VehicleId"", 
    ""SellerId"", 
    ""Name"", 
    ""Description"", 
    ""Price"", 
    ""Condition"",
    ""FrameSize"", 
    ""UsageHistory"", 
    ""Model"", 
    ""BrandId"", 
    ""CategoryId"", 
    ""Status"",
    ""CreatedAt"", 
    ""UpdatedAt"", 
    ""IsInspected""
FROM ""Vehicles""
WHERE ""VehicleId"" = @id AND ""SellerId"" = @uid
", conn);

            cmd.Parameters.AddWithValue("id", id);
            cmd.Parameters.AddWithValue("uid", userId);

            await using var rd = await cmd.ExecuteReaderAsync();
            if (!await rd.ReadAsync()) return null;

            return new Vehicle
            {
                VehicleId = rd.GetInt32(0),
                SellerId = rd.GetInt32(1),
                Name = rd.GetString(2),
                Description = rd.IsDBNull(3) ? null : rd.GetString(3),
                Price = rd.GetDecimal(4),
                Condition = rd.IsDBNull(5) ? null : rd.GetString(5),
                FrameSize = rd.IsDBNull(6) ? null : rd.GetString(6),
                UsageHistory = rd.IsDBNull(7) ? null : rd.GetString(7),
                Model = rd.IsDBNull(8) ? null : rd.GetString(8),
                BrandId = rd.IsDBNull(9) ? null : rd.GetInt32(9),
                CategoryId = rd.IsDBNull(10) ? null : rd.GetInt32(10),
                Status = rd.IsDBNull(11) ? null : rd.GetString(11),
                CreatedAt = rd.IsDBNull(12) ? null : rd.GetDateTime(12),
                UpdatedAt = rd.IsDBNull(13) ? null : rd.GetDateTime(13),
                IsInspected = rd.IsDBNull(14) ? null : rd.GetBoolean(14)
            };
        }

        public async Task UpdateVehicleAsync(Vehicle v)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
UPDATE ""Vehicles"" SET
    ""Name"" = @name,
    ""Description"" = @desc,
    ""Price"" = @price,
    ""Condition"" = @cond,
    ""FrameSize"" = @frame,
    ""UsageHistory"" = @usage,
    ""Model"" = @model,
    ""BrandId"" = @brand,
    ""CategoryId"" = @cat,
    ""UpdatedAt"" = NOW()
WHERE ""VehicleId"" = @id AND ""SellerId"" = @uid
", conn);

            cmd.Parameters.AddWithValue("id", v.VehicleId);
            cmd.Parameters.AddWithValue("uid", v.SellerId);
            cmd.Parameters.AddWithValue("name", v.Name);
            cmd.Parameters.AddWithValue("desc", (object?)v.Description ?? DBNull.Value);
            cmd.Parameters.AddWithValue("price", v.Price);
            cmd.Parameters.AddWithValue("cond", (object?)v.Condition ?? DBNull.Value);
            cmd.Parameters.AddWithValue("frame", (object?)v.FrameSize ?? DBNull.Value);
            cmd.Parameters.AddWithValue("usage", (object?)v.UsageHistory ?? DBNull.Value);
            cmd.Parameters.AddWithValue("model", (object?)v.Model ?? DBNull.Value);
            cmd.Parameters.AddWithValue("brand", (object?)v.BrandId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("cat", (object?)v.CategoryId ?? DBNull.Value);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task HideAsync(int id, int userId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
UPDATE ""Vehicles"" SET 
    ""Status"" = 'hidden', 
    ""UpdatedAt"" = NOW()
WHERE ""VehicleId"" = @id AND ""SellerId"" = @uid
", conn);

            cmd.Parameters.AddWithValue("id", id);
            cmd.Parameters.AddWithValue("uid", userId);
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task InsertMediaAsync(int vehicleId, string type, string url)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
INSERT INTO ""VehicleMedia"" (""VehicleId"", ""Type"", ""Url"")
VALUES (@vid, @type, @url)
", conn);

            cmd.Parameters.AddWithValue("vid", vehicleId);
            cmd.Parameters.AddWithValue("type", type);
            cmd.Parameters.AddWithValue("url", url);

            await cmd.ExecuteNonQueryAsync();
        }
    }
}
