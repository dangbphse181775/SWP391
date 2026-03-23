using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Application.Services;
using Bike_Link.Domain.IRepository;
using BikeLink.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BikeLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _service;
        private readonly IWalletRepository _walletRepo;

        public WalletController(IWalletService service, IWalletRepository walletRepo)
        {
            _service = service;
            _walletRepo = walletRepo;
        }

        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance()
        {
            int userId = User.GetUserId();
            var result =
                await _service.GetBalanceAsync(userId);

            return Ok(result);
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            int userId = User.GetUserId();

            var list =
                await _service.GetTransactionsAsync(userId);

            return Ok(list);
        }

        // ===================== USER — RÚT TIỀN =====================

        /// <summary>
        /// [User] Tạo yêu cầu rút tiền (tối thiểu 50.000đ)
        /// </summary>
        [HttpPost("withdraw")]
        public async Task<IActionResult> CreateWithdrawal(
            [FromBody] WithdrawalRequest request)
        {
            try
            {
                int userId = User.GetUserId();

                var result =
                    await _service.CreateWithdrawalAsync(userId, request);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ===================== ADMIN — VÍ TỔNG =====================

        /// <summary>
        /// [Admin] Xem số dư Ví Tổng
        /// </summary>
        [HttpGet("system/balance")]
        public async Task<IActionResult> GetSystemBalance()
        {
            try
            {
                string role = User.GetRole();
                if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
                    return Forbid();

                var systemWallet = await _walletRepo.GetSystemWalletAsync();

                return Ok(new
                {
                    success = true,
                    walletId = systemWallet.WalletId,
                    balance = systemWallet.Balance,
                    message = $"Số dư Ví Tổng: {systemWallet.Balance:N0}đ"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// [Admin] Xem lịch sử dòng tiền Ví Tổng
        /// </summary>
        [HttpGet("system/transactions")]
        public async Task<IActionResult> GetSystemTransactions()
        {
            try
            {
                string role = User.GetRole();
                if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
                    return Forbid();

                var transactions = await _walletRepo.GetTransactionsAsync(1);

                return Ok(new
                {
                    success = true,
                    count = transactions.Count,
                    transactions = transactions.Select(t => new
                    {
                        t.WalletTransactionId,
                        t.Amount,
                        t.Type,
                        t.Status,
                        t.Description,
                        t.TxnRef,
                        t.CreatedAt
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ===================== ADMIN — DUYỆT RÚT TIỀN =====================

        /// <summary>
        /// [Admin] Xem danh sách yêu cầu rút tiền đang chờ duyệt
        /// </summary>
        [HttpGet("withdraw/pending")]
        public async Task<IActionResult> GetPendingWithdrawals()
        {
            try
            {
                string role = User.GetRole();
                if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
                    return Forbid();

                var list = await _service.GetPendingWithdrawalsAsync();

                return Ok(new
                {
                    success = true,
                    count = list.Count,
                    withdrawals = list
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// [Admin] Duyệt yêu cầu rút tiền
        /// </summary>
        [HttpPut("withdraw/{id}/approve")]
        public async Task<IActionResult> ApproveWithdrawal(int id)
        {
            try
            {
                string role = User.GetRole();
                if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
                    return Forbid();

                var result = await _service.ApproveWithdrawalAsync(id);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// [Admin] Từ chối yêu cầu rút tiền (hoàn tiền về ví user)
        /// </summary>
        [HttpPut("withdraw/{id}/reject")]
        public async Task<IActionResult> RejectWithdrawal(int id)
        {
            try
            {
                string role = User.GetRole();
                if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
                    return Forbid();

                var result = await _service.RejectWithdrawalAsync(id);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
