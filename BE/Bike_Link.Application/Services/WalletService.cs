using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Microsoft.AspNetCore.Http;

namespace Bike_Link.Application.Services
{
    public class WalletService : IWalletService
    {
        private readonly IWalletRepository _walletRepo;
        private readonly VNPayService _vnpay;

        public WalletService(
            IWalletRepository walletRepo,
            VNPayService vnpay)
        {
            _walletRepo = walletRepo;
            _vnpay = vnpay;
        }

        // Lấy ví
        public async Task<Wallet?> GetWalletAsync(int userId)
        {
            return await _walletRepo.GetByUserIdAsync(userId);
        }

        // Tạo payment VNPay
        public async Task<string> CreateDepositAsync(
            int userId,
            decimal amount,
            HttpContext context)
        {
            var wallet = await _walletRepo.GetByUserIdAsync(userId);

            if (wallet == null)
                throw new Exception("Wallet not found");

            string txnRef = Guid.NewGuid().ToString();

            await _walletRepo.CreateDepositAsync(
                wallet.WalletId,
                amount,
                txnRef
            );

            string paymentUrl =
                _vnpay.CreatePaymentUrl(
                    txnRef,
                    amount,
                    context
                );

            return paymentUrl;
        }

        // Handle VNPay callback
        public async Task<string> HandleVNPayReturnAsync(
            IQueryCollection query)
        {
            bool valid =
                _vnpay.ValidateSignature(query);

            if (!valid)
                return "Invalid signature";

            string txnRef = query["vnp_TxnRef"];
            string responseCode = query["vnp_ResponseCode"];

            // parse an toàn
            if (!long.TryParse(query["vnp_Amount"], out long vnpAmount))
                return "Invalid amount format";
            decimal amount = (decimal)vnpAmount / 100;

            var transaction =
                await _walletRepo.GetByTxnRefAsync(txnRef);

            if (transaction == null)
                return "Transaction not found";

            // chống double callback
            if (transaction.Status != "pending")
                return "Transaction already processed";

            if (responseCode == "00")
            {
                await _walletRepo.AddBalanceAsync(
                    transaction.WalletId,
                    amount
                );

                await _walletRepo.UpdateStatusAsync(
                    txnRef,
                    "success"
                );

                return "Deposit success";
            }

            await _walletRepo.UpdateStatusAsync(
                txnRef,
                "failed"
            );

            return "Payment failed";
        }


        public async Task<WalletBalanceDto> GetBalanceAsync(int userId)
        {
            var balance = await _walletRepo.GetBalanceAsync(userId);

            return new WalletBalanceDto
            {
                Balance = balance
            };
        }

        public async Task<List<WalletTransactionDto>> GetTransactionsAsync(int userId)
        {
            var data = await _walletRepo.GetTransactionsAsync(userId);

            return data.Select(t => new WalletTransactionDto
            {
                Amount = t.Amount,
                Type = t.Type,
                Status = t.Status,
                Description = t.Description,
                CreatedAt = (DateTime)t.CreatedAt
            }).ToList();
        }
    }
}
