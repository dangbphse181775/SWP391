using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
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
        INSERT INTO vehicles
        (seller_id, name, description, price, condition, frame_size, usage_history, model, brand_id, category_id, status)
        VALUES
        (@seller, @name, @desc, @price, @cond, @frame, @usage, @model, @brand, @cat, 'pending_approval')
        RETURNING vehicle_id;
    ", conn);

            cmd.Parameters.AddWithValue("seller", v.SellerId);
            cmd.Parameters.AddWithValue("name", v.Name);
            cmd.Parameters.AddWithValue("desc", v.Description);
            cmd.Parameters.AddWithValue("price", v.Price);
            cmd.Parameters.AddWithValue("cond", v.Condition);
            cmd.Parameters.AddWithValue("frame", v.FrameSize);
            cmd.Parameters.AddWithValue("usage", v.UsageHistory);
            cmd.Parameters.AddWithValue("model", v.Model);
            cmd.Parameters.AddWithValue("brand", v.BrandId);
            cmd.Parameters.AddWithValue("cat", v.CategoryId);

            return (int)(await cmd.ExecuteScalarAsync())!;
        }

        public async Task<List<Vehicle>> GetBySellerAsync(int sellerId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
        SELECT vehicle_id, name, price, status
        FROM vehicles
        WHERE seller_id = @sid
        ORDER BY created_at DESC
    ", conn);

            cmd.Parameters.AddWithValue("sid", sellerId);

            var list = new List<Vehicle>();
            await using var rd = await cmd.ExecuteReaderAsync();
            while (await rd.ReadAsync())
            {
                list.Add(new Vehicle
                {
                    VehicleId = rd.GetInt32(0),
                    Name = rd.GetString(1),
                    Price = rd.GetDecimal(2),
                    Status = rd.GetString(3)
                });
            }
            return list;
        }

        public async Task<Vehicle?> GetByIdAsync(int id, int sellerId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
        SELECT vehicle_id, seller_id, name, description, price, condition,
               frame_size, usage_history, model, brand_id, category_id, status,
               created_at,updated_at
        FROM vehicles
        WHERE vehicle_id = @id AND seller_id = @sid
    ", conn);

            cmd.Parameters.AddWithValue("id", id);
            cmd.Parameters.AddWithValue("sid", sellerId);

            await using var rd = await cmd.ExecuteReaderAsync();
            if (!await rd.ReadAsync()) return null;

            return new Vehicle
            {
                VehicleId = rd.GetInt32(0),
                SellerId = rd.GetInt32(1),
                Name = rd.GetString(2),
                Description = rd.GetString(3),
                Price = rd.GetDecimal(4),
                Condition = rd.GetString(5),
                FrameSize = rd.GetString(6),
                UsageHistory = rd.GetString(7),
                Model = rd.GetString(8),
                BrandId = rd.GetInt32(9),
                CategoryId = rd.GetInt32(10),
                Status = rd.GetString(11),
                CreatedAt = rd.IsDBNull(12) ? null : rd.GetDateTime(12),
                UpdatedAt = rd.IsDBNull(13) ? null : rd.GetDateTime(13)

            };
        }

        public async Task UpdateVehicleAsync(Vehicle v)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
        UPDATE vehicles SET
            name=@name, description=@desc, price=@price,
            condition=@cond, frame_size=@frame,
            usage_history=@usage, model=@model,
            brand_id=@brand, category_id=@cat
        WHERE vehicle_id=@id AND seller_id=@sid
    ", conn);

            cmd.Parameters.AddWithValue("id", v.VehicleId);
            cmd.Parameters.AddWithValue("sid", v.SellerId);
            cmd.Parameters.AddWithValue("name", v.Name);
            cmd.Parameters.AddWithValue("desc", v.Description);
            cmd.Parameters.AddWithValue("price", v.Price);
            cmd.Parameters.AddWithValue("cond", v.Condition);
            cmd.Parameters.AddWithValue("frame", v.FrameSize);
            cmd.Parameters.AddWithValue("usage", v.UsageHistory);
            cmd.Parameters.AddWithValue("model", v.Model);
            cmd.Parameters.AddWithValue("brand", v.BrandId);
            cmd.Parameters.AddWithValue("cat", v.CategoryId);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task HideAsync(int id, int sellerId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
        UPDATE vehicles SET status = 'hidden'
        WHERE vehicle_id = @id AND seller_id = @sid
    ", conn);

            cmd.Parameters.AddWithValue("id", id);
            cmd.Parameters.AddWithValue("sid", sellerId);
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task InsertMediaAsync(int vehicleId, string type, string url)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
            INSERT INTO vehicle_media (vehicle_id, type, url)
            VALUES (@vid, @type, @url)
        ", conn);

            cmd.Parameters.AddWithValue("vid", vehicleId);
            cmd.Parameters.AddWithValue("type", type);
            cmd.Parameters.AddWithValue("url", url);

            await cmd.ExecuteNonQueryAsync();
        }
    }
}
