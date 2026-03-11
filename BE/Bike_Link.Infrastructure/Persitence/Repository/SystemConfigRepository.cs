using System.Globalization;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Npgsql;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class SystemConfigRepository : ISystemConfigRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public SystemConfigRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<List<SystemConfig>> GetAllAsync()
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
SELECT ""Key"", ""Value"", ""Description"", ""UpdatedAt""
FROM ""SystemConfigs""
ORDER BY ""Key""
", conn);

            var list = new List<SystemConfig>();
            await using var rd = await cmd.ExecuteReaderAsync();
            while (await rd.ReadAsync())
            {
                list.Add(new SystemConfig
                {
                    Key = rd.GetString(0),
                    Value = rd.GetString(1),
                    Description = rd.IsDBNull(2) ? null : rd.GetString(2),
                    UpdatedAt = rd.IsDBNull(3) ? null : rd.GetDateTime(3)
                });
            }
            return list;
        }

        public async Task<SystemConfig?> GetByKeyAsync(string key)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(@"
SELECT ""Key"", ""Value"", ""Description"", ""UpdatedAt""
FROM ""SystemConfigs""
WHERE ""Key"" = @key
", conn);
            cmd.Parameters.AddWithValue("key", key);

            await using var rd = await cmd.ExecuteReaderAsync();
            if (await rd.ReadAsync())
            {
                return new SystemConfig
                {
                    Key = rd.GetString(0),
                    Value = rd.GetString(1),
                    Description = rd.IsDBNull(2) ? null : rd.GetString(2),
                    UpdatedAt = rd.IsDBNull(3) ? null : rd.GetDateTime(3)
                };
            }
            return null;
        }

        public async Task UpdateAsync(string key, string value, string? description = null)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            string sql = description != null
                ? @"UPDATE ""SystemConfigs"" SET ""Value"" = @value, ""Description"" = @desc, ""UpdatedAt"" = NOW() WHERE ""Key"" = @key"
                : @"UPDATE ""SystemConfigs"" SET ""Value"" = @value, ""UpdatedAt"" = NOW() WHERE ""Key"" = @key";

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("key", key);
            cmd.Parameters.AddWithValue("value", value);
            if (description != null)
                cmd.Parameters.AddWithValue("desc", description);

            int rows = await cmd.ExecuteNonQueryAsync();
            if (rows == 0)
                throw new Exception($"Config key '{key}' không tồn tại");
        }

        public async Task<decimal> GetDecimalAsync(string key, decimal defaultValue)
        {
            var config = await GetByKeyAsync(key);
            if (config == null) return defaultValue;
            return decimal.TryParse(config.Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var result) ? result : defaultValue;
        }

        public async Task<int> GetIntAsync(string key, int defaultValue)
        {
            var config = await GetByKeyAsync(key);
            if (config == null) return defaultValue;
            return int.TryParse(config.Value, out var result) ? result : defaultValue;
        }
    }
}
