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

        /// <summary>
        /// Trừ số dư ví (dùng cho thanh toán)
        /// </summary>
        Task<bool> DeductBalanceAsync(int walletId, decimal amount);

        /// <summary>
        /// Ghi WalletTransaction khi thanh toán
        /// </summary>
        Task CreatePaymentTransactionAsync(int walletId, decimal amount, string description, string status = "success");

        /// <summary>
        /// Lấy Ví Tổng (System Wallet) — UserId = 1 (Admin)
        /// </summary>
        Task<Wallet> GetSystemWalletAsync();

        /// <summary>
        /// Tạo yêu cầu rút tiền (withdrawal) — status = pending
        /// </summary>
        Task<int> CreateWithdrawalAsync(int walletId, decimal amount,
            string bankName, string bankAccountNumber, string bankAccountName);

        /// <summary>
        /// Lấy 1 bản ghi withdrawal theo ID
        /// </summary>
        Task<WalletTransaction?> GetWithdrawalByIdAsync(int transactionId);

        /// <summary>
        /// Cập nhật trạng thái transaction theo WalletTransactionId
        /// </summary>
        Task UpdateStatusByIdAsync(int transactionId, string status);

        /// <summary>
        /// Lấy danh sách yêu cầu rút tiền đang chờ duyệt (Admin)
        /// </summary>
        Task<List<WalletTransaction>> GetPendingWithdrawalsAsync();
    }
}
