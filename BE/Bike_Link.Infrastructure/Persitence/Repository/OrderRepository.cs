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
    public class OrderRepository : IOrderRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public OrderRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
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
    }
}
