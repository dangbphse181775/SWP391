using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Domain.Models;
using Microsoft.AspNetCore.Http;

namespace Bike_Link.Application.IService
{
    public interface IWalletService
    {
        Task<Wallet?> GetWalletAsync(int userId);

        Task<string> CreateDepositAsync(int userId, decimal amount, HttpContext context);

        Task<string> HandleVNPayReturnAsync(IQueryCollection query);

        Task<WalletBalanceDto> GetBalanceAsync(int userId);

        Task<List<WalletTransactionDto>> GetTransactionsAsync(int userId);

        // ===== Withdrawal =====
        Task<WithdrawalResultDto> CreateWithdrawalAsync(int userId, WithdrawalRequest request);
        Task<WithdrawalResultDto> ApproveWithdrawalAsync(int transactionId);
        Task<WithdrawalResultDto> RejectWithdrawalAsync(int transactionId);
        Task<List<object>> GetPendingWithdrawalsAsync();
    }
}
