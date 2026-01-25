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
    public class UserRepository : IUserRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public UserRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<bool> IsSellerAsync(int userId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand(
                "SELECT 1 FROM sellers WHERE user_id = @uid", conn);
            cmd.Parameters.AddWithValue("uid", userId);

            return await cmd.ExecuteScalarAsync() != null;
        }

        public async Task UpgradeToSellerAsync(Seller seller)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            await using var tx = await conn.BeginTransactionAsync();

            try
            {
                // Insert seller profile
                await using (var cmd = new NpgsqlCommand(@"
                INSERT INTO sellers (user_id, shop_name, description)
                VALUES (@uid, @shop, @desc)
            ", conn, tx))
                {
                    cmd.Parameters.AddWithValue("uid", seller.UserId);
                    cmd.Parameters.AddWithValue("shop", (object?)seller.ShopName ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("desc", (object?)seller.Description ?? DBNull.Value);
                    await cmd.ExecuteNonQueryAsync();
                }

                // Update role -> seller
                await using (var cmd = new NpgsqlCommand(@"
                UPDATE users
                SET role_id = (SELECT role_id FROM role WHERE role_name = 'seller')
                WHERE user_id = @uid
            ", conn, tx))
                {
                    cmd.Parameters.AddWithValue("uid", seller.UserId);
                    await cmd.ExecuteNonQueryAsync();
                }

                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }
    }
}
