using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class OrderRepository : IOrderRepository
    {
        private readonly NpgsqlDataSource _dataSource;
        private readonly BikeLinkContext _context;

        public OrderRepository(NpgsqlDataSource dataSource, BikeLinkContext context)
        {
            _dataSource = dataSource;
            _context = context;
        }

        public async Task<int> CreateOrderAsync(Order order)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
INSERT INTO ""Orders""
(
    ""BuyerId"",
    ""SellerId"",
    ""Status"",
    ""Amount"",
    ""DepositAmount"",
    ""CreatedAt""
)
VALUES
(
    @buyerId,
    @sellerId,
    @status,
    @amount,
    @depositAmount,
    NOW()
)
RETURNING ""OrderId""
", conn);

            cmd.Parameters.AddWithValue("buyerId", order.BuyerId);
            cmd.Parameters.AddWithValue("sellerId", order.SellerId);
            cmd.Parameters.AddWithValue("status", order.Status);
            cmd.Parameters.AddWithValue("amount", order.Amount);
            cmd.Parameters.AddWithValue("depositAmount", (object?)order.DepositAmount ?? DBNull.Value);

            var result = await cmd.ExecuteScalarAsync();
            return (int)result!;
        }

        public async Task CreateOrderDetailAsync(OrderDetail detail)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
INSERT INTO ""OrderDetails""
(
    ""OrderId"",
    ""VehicleId"",
    ""Quantity"",
    ""Price""
)
VALUES
(
    @orderId,
    @vehicleId,
    @quantity,
    @price
)
", conn);

            cmd.Parameters.AddWithValue("orderId", detail.OrderId);
            cmd.Parameters.AddWithValue("vehicleId", detail.VehicleId);
            cmd.Parameters.AddWithValue("quantity", detail.Quantity);
            cmd.Parameters.AddWithValue("price", detail.Price);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task CreatePaymentAsync(Payment payment)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
INSERT INTO ""Payments""
(
    ""OrderId"",
    ""Amount"",
    ""Method"",
    ""Provider"",
    ""TransactionCode"",
    ""Status"",
    ""CreatedAt""
)
VALUES
(
    @orderId,
    @amount,
    @method,
    @provider,
    @txnCode,
    @status,
    NOW()
)
", conn);

            cmd.Parameters.AddWithValue("orderId", payment.OrderId);
            cmd.Parameters.AddWithValue("amount", payment.Amount);
            cmd.Parameters.AddWithValue("method", (object?)payment.Method ?? DBNull.Value);
            cmd.Parameters.AddWithValue("provider", (object?)payment.Provider ?? DBNull.Value);
            cmd.Parameters.AddWithValue("txnCode", (object?)payment.TransactionCode ?? DBNull.Value);
            cmd.Parameters.AddWithValue("status", (object?)payment.Status ?? DBNull.Value);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task UpdateVehicleStatusAsync(int vehicleId, string status)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
UPDATE ""Vehicles""
SET ""Status"" = @status,
    ""UpdatedAt"" = NOW()
WHERE ""VehicleId"" = @vehicleId
", conn);

            cmd.Parameters.AddWithValue("vehicleId", vehicleId);
            cmd.Parameters.AddWithValue("status", status);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task RemoveCartItemsAsync(int cartId, List<int> vehicleIds)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
DELETE FROM ""CartItems""
WHERE ""CartId"" = @cartId
  AND ""VehicleId"" = ANY(@vehicleIds)
", conn);

            cmd.Parameters.AddWithValue("cartId", cartId);
            cmd.Parameters.AddWithValue("vehicleIds", vehicleIds.ToArray());

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT ""OrderId"", ""BuyerId"", ""SellerId"", ""Status"", ""Amount"", ""DepositAmount"", ""CreatedAt"", ""UpdatedAt"", ""ShippingProofUrl""
FROM ""Orders""
WHERE ""OrderId"" = @orderId
", conn);

            cmd.Parameters.AddWithValue("orderId", orderId);

            await using var rd = await cmd.ExecuteReaderAsync();

            if (!await rd.ReadAsync()) return null;

            return new Order
            {
                OrderId = rd.GetInt32(0),
                BuyerId = rd.GetInt32(1),
                SellerId = rd.GetInt32(2),
                Status = rd.GetString(3),
                Amount = rd.GetDecimal(4),
                DepositAmount = rd.IsDBNull(5) ? null : rd.GetDecimal(5),
                CreatedAt = rd.GetDateTime(6),
                UpdatedAt = rd.IsDBNull(7) ? null : rd.GetDateTime(7),
                ShippingProofUrl = rd.IsDBNull(8) ? null : rd.GetString(8)
            };
        }

        public async Task UpdateOrderStatusAsync(int orderId, string status)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
UPDATE ""Orders""
SET ""Status"" = @status,
    ""UpdatedAt"" = NOW()
WHERE ""OrderId"" = @orderId
", conn);

            cmd.Parameters.AddWithValue("orderId", orderId);
            cmd.Parameters.AddWithValue("status", status);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<List<Order>> GetExpiredDepositOrdersAsync()
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT ""OrderId"", ""BuyerId"", ""SellerId"", ""Status"", ""Amount"", ""DepositAmount"", ""CreatedAt""
FROM ""Orders""
WHERE ""Status"" = 'deposited'
  AND ""CreatedAt"" < NOW() - INTERVAL '72 hours'
", conn);

            var list = new List<Order>();
            await using var rd = await cmd.ExecuteReaderAsync();

            while (await rd.ReadAsync())
            {
                list.Add(new Order
                {
                    OrderId = rd.GetInt32(0),
                    BuyerId = rd.GetInt32(1),
                    SellerId = rd.GetInt32(2),
                    Status = rd.GetString(3),
                    Amount = rd.GetDecimal(4),
                    DepositAmount = rd.IsDBNull(5) ? null : rd.GetDecimal(5),
                    CreatedAt = rd.GetDateTime(6)
                });
            }

            return list;
        }

        public async Task<List<int>> GetVehicleIdsByOrderIdAsync(int orderId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT ""VehicleId""
FROM ""OrderDetails""
WHERE ""OrderId"" = @orderId
", conn);

            cmd.Parameters.AddWithValue("orderId", orderId);

            var ids = new List<int>();
            await using var rd = await cmd.ExecuteReaderAsync();

            while (await rd.ReadAsync())
            {
                ids.Add(rd.GetInt32(0));
            }

            return ids;
        }

        // Thêm vào class OrderRepository

        /// Lấy chi tiết Order bao gồm Buyer, Seller, OrderDetails (với Vehicle và VehicleMedia), Payments, Shipping
        public async Task<Order?> GetOrderDetailByIdAsync(int orderId)
        {
            return await _context.Orders
                .Include(o => o.Buyer)
                .Include(o => o.Seller)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Vehicle)
                        .ThenInclude(v => v.VehicleMedia)
                .Include(o => o.Shipping)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task<List<Order>> GetOrdersByUserIdAsync(int userId, string role)
        {
            var query = _context.Orders
                .Include(o => o.Buyer)
                .Include(o => o.Seller)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Vehicle)
                        .ThenInclude(v => v.VehicleMedia)
                .AsQueryable();

            if (role.Equals("Buyer", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(o => o.BuyerId == userId);
            }
            else if (role.Equals("Seller", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(o => o.SellerId == userId);
            }
            else
            {
                query = query.Where(o => o.BuyerId == userId || o.SellerId == userId);
            }


            return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        }

        public async Task UpdateOrderShippingProofAsync(int orderId, string shippingProofUrl)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
UPDATE ""Orders""
SET ""Status"" = 'shipped',
    ""ShippingProofUrl"" = @url,
    ""UpdatedAt"" = NOW()
WHERE ""OrderId"" = @orderId
", conn);

            cmd.Parameters.AddWithValue("orderId", orderId);
            cmd.Parameters.AddWithValue("url", shippingProofUrl);

            await cmd.ExecuteNonQueryAsync();
        }
    }
}
