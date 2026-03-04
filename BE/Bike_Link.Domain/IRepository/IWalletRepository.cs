using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository
{
    public interface IWalletRepository
    {
        Task<Wallet?> GetByUserIdAsync(int userId);

        Task CreateDepositAsync(int walletId, decimal amount, string txnRef);

        Task<WalletTransaction?> GetByTxnRefAsync(string txnRef);

        Task UpdateStatusAsync(string txnRef, string status);

        Task AddBalanceAsync(int walletId, decimal amount);
        Task<decimal> GetBalanceAsync(int userId);

        Task<List<WalletTransaction>> GetTransactionsAsync(int userId);
        Task CreateWalletAsync(int userId);
    }
}
