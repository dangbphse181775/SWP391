using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Npgsql;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class PublicVehicleRepository : IPublicVehicleRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public PublicVehicleRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }


        public async Task<List<Vehicle>> SearchAsync(VehicleSearchOptions o)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            var sql = new StringBuilder(@"
SELECT v.""VehicleId"",
       v.""Name"",
       v.""Price"",
       v.""Condition"",
       v.""FrameSize"",
       v.""UsageHistory"",
       v.""Model"",
       b.""BrandName"",
       c.""CategoryName"",
       (
           SELECT m.""Url""
           FROM ""VehicleMedia"" m
           WHERE m.""VehicleId"" = v.""VehicleId"" AND m.""Type"" = 'image'
           ORDER BY m.""MediaId""
           LIMIT 1
       ) AS thumbnail
FROM ""Vehicles"" v
LEFT JOIN ""Brands"" b ON v.""BrandId"" = b.""BrandId""
LEFT JOIN ""Categories"" c ON v.""CategoryId"" = c.""CategoryId""
WHERE v.""Status"" = 'active'
");

            var cmd = new NpgsqlCommand { Connection = conn };

            if (!string.IsNullOrWhiteSpace(o.Keyword))
            {
                sql.Append(@" AND v.""Name"" ILIKE @kw");
                cmd.Parameters.AddWithValue("kw", $"%{o.Keyword}%");
            }

            if (o.BrandId.HasValue)
            {
                sql.Append(@" AND v.""BrandId"" = @bid");
                cmd.Parameters.AddWithValue("bid", o.BrandId.Value);
            }

            if (o.CategoryId.HasValue)
            {
                sql.Append(@" AND v.""CategoryId"" = @cid");
                cmd.Parameters.AddWithValue("cid", o.CategoryId.Value);
            }

            if (o.PriceFrom.HasValue)
            {
                sql.Append(@" AND v.""Price"" >= @from");
                cmd.Parameters.AddWithValue("from", o.PriceFrom.Value);
            }

            if (o.PriceTo.HasValue)
            {
                sql.Append(@" AND v.""Price"" <= @to");
                cmd.Parameters.AddWithValue("to", o.PriceTo.Value);
            }

            int offset = (o.Page - 1) * o.PageSize;

            sql.Append(@"
ORDER BY v.""CreatedAt"" DESC
LIMIT @limit OFFSET @offset
");

            cmd.Parameters.AddWithValue("limit", o.PageSize);
            cmd.Parameters.AddWithValue("offset", offset);
            cmd.CommandText = sql.ToString();

            var list = new List<Vehicle>();
            await using var rd = await cmd.ExecuteReaderAsync();

            while (await rd.ReadAsync())
            {
                list.Add(new Vehicle
                {
                    VehicleId = rd.GetInt32(0),
                    Name = rd.GetString(1),
                    Price = rd.GetDecimal(2),
                    Condition = rd.IsDBNull(3) ? null : rd.GetString(3),
                    FrameSize = rd.IsDBNull(4) ? null : rd.GetString(4),
                    UsageHistory = rd.IsDBNull(5) ? null : rd.GetString(5),
                    Model = rd.IsDBNull(6) ? null : rd.GetString(6),
                    BrandName = rd.IsDBNull(7) ? null : rd.GetString(7),
                    CategoryName = rd.IsDBNull(8) ? null : rd.GetString(8),
                    ThumbnailUrl = rd.IsDBNull(9) ? null : rd.GetString(9)
                });
            }

            return list;
        }
    }
}
