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

        // ===================== WITHDRAWAL =====================

        private const decimal MIN_WITHDRAWAL = 50_000;

        public async Task<WithdrawalResultDto> CreateWithdrawalAsync(
            int userId, WithdrawalRequest request)
        {
            // Validate số tiền tối thiểu
            if (request.Amount < MIN_WITHDRAWAL)
                return new WithdrawalResultDto
                {
                    Success = false,
                    Message = $"Số tiền rút tối thiểu là {MIN_WITHDRAWAL:N0}đ"
                };

            // Validate thông tin ngân hàng
            if (string.IsNullOrWhiteSpace(request.BankName) ||
                string.IsNullOrWhiteSpace(request.BankAccountNumber) ||
                string.IsNullOrWhiteSpace(request.BankAccountName))
                return new WithdrawalResultDto
                {
                    Success = false,
                    Message = "Vui lòng nhập đầy đủ thông tin ngân hàng"
                };

            var wallet = await _walletRepo.GetByUserIdAsync(userId);
            if (wallet == null)
                return new WithdrawalResultDto
                {
                    Success = false,
                    Message = "Wallet not found"
                };

            // Kiểm tra và trừ balance ngay (khóa tiền)
            bool deducted = await _walletRepo.DeductBalanceAsync(
                wallet.WalletId, request.Amount);

            if (!deducted)
                return new WithdrawalResultDto
                {
                    Success = false,
                    Message = "Số dư không đủ để rút tiền"
                };

            // Tạo bản ghi withdrawal pending
            int txnId = await _walletRepo.CreateWithdrawalAsync(
                wallet.WalletId,
                request.Amount,
                request.BankName.Trim(),
                request.BankAccountNumber.Trim(),
                request.BankAccountName.Trim());

            var newBalance = await _walletRepo.GetBalanceAsync(userId);

            return new WithdrawalResultDto
            {
                Success = true,
                Message = "Yêu cầu rút tiền đã được tạo, đang chờ Admin duyệt",
                TransactionId = txnId,
                RemainingBalance = newBalance
            };
        }

        public async Task<WithdrawalResultDto> ApproveWithdrawalAsync(int transactionId)
        {
            var txn = await _walletRepo.GetWithdrawalByIdAsync(transactionId);

            if (txn == null)
                return new WithdrawalResultDto
                {
                    Success = false,
                    Message = "Không tìm thấy yêu cầu rút tiền"
                };

            if (txn.Type != "withdrawal" || txn.Status != "pending")
                return new WithdrawalResultDto
                {
                    Success = false,
                    Message = "Yêu cầu này không hợp lệ hoặc đã được xử lý"
                };

            // Cập nhật status = success
            await _walletRepo.UpdateStatusByIdAsync(
                txn.WalletTransactionId, "success");

            return new WithdrawalResultDto
            {
                Success = true,
                Message = "Đã duyệt yêu cầu rút tiền thành công",
                TransactionId = transactionId
            };
        }

        public async Task<WithdrawalResultDto> RejectWithdrawalAsync(int transactionId)
        {
            var txn = await _walletRepo.GetWithdrawalByIdAsync(transactionId);

            if (txn == null)
                return new WithdrawalResultDto
                {
                    Success = false,
                    Message = "Không tìm thấy yêu cầu rút tiền"
                };

            if (txn.Type != "withdrawal" || txn.Status != "pending")
                return new WithdrawalResultDto
                {
                    Success = false,
                    Message = "Yêu cầu này không hợp lệ hoặc đã được xử lý"
                };

            // Hoàn trả balance cho user
            await _walletRepo.AddBalanceAsync(txn.WalletId, txn.Amount);

            // Cập nhật status = rejected
            await _walletRepo.UpdateStatusByIdAsync(
                txn.WalletTransactionId, "rejected");

            return new WithdrawalResultDto
            {
                Success = true,
                Message = "Đã từ chối yêu cầu rút tiền, hoàn trả số dư cho người dùng",
                TransactionId = transactionId
            };
        }

        public async Task<List<object>> GetPendingWithdrawalsAsync()
        {
            var list = await _walletRepo.GetPendingWithdrawalsAsync();

            return list.Select(t => (object)new
            {
                t.WalletTransactionId,
                t.Amount,
                t.BankName,
                t.BankAccountNumber,
                t.BankAccountName,
                t.Status,
                t.CreatedAt,
                UserId = t.Wallet?.UserId
            }).ToList();
        }
    }
}
