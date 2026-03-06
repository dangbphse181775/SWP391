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
    public class WalletRepository : IWalletRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public WalletRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<Wallet?> GetByUserIdAsync(int userId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT ""WalletId"", ""UserId"", ""Balance""
FROM ""Wallets""
WHERE ""UserId"" = @uid
", conn);

            cmd.Parameters.AddWithValue("uid", userId);

            await using var rd = await cmd.ExecuteReaderAsync();

            if (!await rd.ReadAsync()) return null;

            return new Wallet
            {
                WalletId = rd.GetInt32(0),
                UserId = rd.GetInt32(1),
                Balance = rd.GetDecimal(2)
            };
        }

        public async Task CreateDepositAsync(
    int walletId,
    decimal amount,
    string txnRef)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
INSERT INTO ""WalletTransactions""
(
""WalletId"",
""Amount"",
""Type"",
""Status"",
""TxnRef"",
""Description"",
""CreatedAt""
)
VALUES
(
@walletId,
@amount,
'deposit',
'pending',
@txnRef,
'Nạp tiền qua VNPay',
NOW()
)", conn);

            cmd.Parameters.AddWithValue("walletId", walletId);
            cmd.Parameters.AddWithValue("amount", amount);
            cmd.Parameters.AddWithValue("txnRef", txnRef);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<WalletTransaction?> GetByTxnRefAsync(string txnRef)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT ""WalletTransactionId"", ""WalletId"", ""Amount"", ""Status""
FROM ""WalletTransactions""
WHERE ""TxnRef"" = @txnRef
", conn);

            cmd.Parameters.AddWithValue("txnRef", txnRef);

            await using var rd = await cmd.ExecuteReaderAsync();

            if (!await rd.ReadAsync()) return null;

            return new WalletTransaction
            {
                WalletTransactionId = rd.GetInt32(0),
                WalletId = rd.GetInt32(1),
                Amount = rd.GetDecimal(2),
                Status = rd.GetString(3)
            };
        }

        public async Task UpdateStatusAsync(string txnRef, string status)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
UPDATE ""WalletTransactions""
SET ""Status"" = @status
WHERE ""TxnRef"" = @txnRef
", conn);

            cmd.Parameters.AddWithValue("status", status);
            cmd.Parameters.AddWithValue("txnRef", txnRef);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task AddBalanceAsync(int walletId, decimal amount)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
UPDATE ""Wallets""
SET ""Balance"" = ""Balance"" + @amount
WHERE ""WalletId"" = @walletId
", conn);

            cmd.Parameters.AddWithValue("walletId", walletId);
            cmd.Parameters.AddWithValue("amount", amount);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<decimal> GetBalanceAsync(int userId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT ""Balance""
FROM ""Wallets""
WHERE ""UserId"" = @uid
", conn);

            cmd.Parameters.AddWithValue("uid", userId);

            var result = await cmd.ExecuteScalarAsync();

            return result == null ? 0 : (decimal)result;
        }

        public async Task<List<WalletTransaction>> GetTransactionsAsync(int userId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
SELECT 
t.""Amount"",
t.""Type"",
t.""Status"",
t.""Description"",
t.""CreatedAt""
FROM ""WalletTransactions"" t
JOIN ""Wallets"" w ON t.""WalletId"" = w.""WalletId""
WHERE w.""UserId"" = @uid
ORDER BY t.""CreatedAt"" DESC
", conn);

            cmd.Parameters.AddWithValue("uid", userId);

            var list = new List<WalletTransaction>();

            await using var rd = await cmd.ExecuteReaderAsync();

            while (await rd.ReadAsync())
            {
                list.Add(new WalletTransaction
                {
                    Amount = rd.GetDecimal(0),
                    Type = rd.GetString(1),
                    Status = rd.GetString(2),
                    Description = rd.IsDBNull(3) ? null : rd.GetString(3),
                    CreatedAt = rd.GetDateTime(4)
                });
            }

            return list;
        }

        public async Task CreateWalletAsync(int userId)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
INSERT INTO ""Wallets""
(
""UserId"",
""Balance"",
""CreatedAt""
)
VALUES
(
@uid,
0,
NOW()
)
", conn);

            cmd.Parameters.AddWithValue("uid", userId);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<bool> DeductBalanceAsync(int walletId, decimal amount)
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
UPDATE ""Wallets""
SET ""Balance"" = ""Balance"" - @amount
WHERE ""WalletId"" = @walletId
  AND ""Balance"" >= @amount
", conn);

            cmd.Parameters.AddWithValue("walletId", walletId);
            cmd.Parameters.AddWithValue("amount", amount);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0; // false nếu không đủ tiền
        }

        public async Task CreatePaymentTransactionAsync(
            int walletId, decimal amount, string description, string status = "success")
        {
            await using var conn = await _dataSource.OpenConnectionAsync();

            await using var cmd = new NpgsqlCommand(@"
INSERT INTO ""WalletTransactions""
(
    ""WalletId"",
    ""Amount"",
    ""Type"",
    ""Status"",
    ""Description"",
    ""CreatedAt""
)
VALUES
(
    @walletId,
    @amount,
    'payment',
    @status,
    @description,
    NOW()
)", conn);

            cmd.Parameters.AddWithValue("walletId", walletId);
            cmd.Parameters.AddWithValue("amount", amount);
            cmd.Parameters.AddWithValue("status", status);
            cmd.Parameters.AddWithValue("description", description);

            await cmd.ExecuteNonQueryAsync();
        }
    }
}
