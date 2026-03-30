using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;

namespace Bike_Link.Application.Services
{
    public class AdminVehicleService : IAdminVehicleService
    {
        private readonly IAdminVehicleRepository _repo;
        private readonly IWalletRepository _walletRepo;
        private readonly ISystemConfigRepository _configRepo;

        public AdminVehicleService(
            IAdminVehicleRepository repo,
            IWalletRepository walletRepo,
            ISystemConfigRepository configRepo)
        {
            _repo = repo;
            _walletRepo = walletRepo;
            _configRepo = configRepo;
        }

        public async Task<List<AdminPendingVehicleDto>> GetPendingAsync()
        {
            var list = await _repo.GetPendingForAdminAsync();

            return list.Select(v => new AdminPendingVehicleDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Price = v.Price,
                SellerName = v.Seller!.FullName!,
                ThumbnailUrl = v.ThumbnailUrl,
                CreatedAt = v.CreatedAt!.Value
            }).ToList();
        }

        public async Task<AdminVehicleDetailDto?> GetDetailAsync(int id)
        {
            var v = await _repo.GetByIdForAdminAsync(id);

            if (v == null) return null;

            return new AdminVehicleDetailDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Description = v.Description,
                Price = v.Price,
                Condition = v.Condition,
                FrameSize = v.FrameSize,
                UsageHistory = v.UsageHistory,
                Model = v.Model,

                SellerName = v.Seller!.FullName!,
                SellerEmail = v.Seller.Email!,

                BrandName = v.Brand?.BrandName,
                CategoryName = v.Category?.CategoryName,

                Media = v.VehicleMedia.Select(x => new MediaDto
                {
                    Type = x.Type!,
                    Url = x.Url
                }).ToList(),

                AdminNote = v.AdminNote,

                CreatedAt = v.CreatedAt!.Value
            };
        }

        public Task ApproveAsync(int id)
            => _repo.ApproveAsync(id);

        public async Task RejectAsync(int id, string note)
        {
            // 1. Lấy thông tin vehicle để biết SellerId và Price
            var vehicle = await _repo.GetByIdForAdminAsync(id);
            if (vehicle == null)
                throw new Exception("Không tìm thấy bài đăng");

            // 2. Tính phí cần hoàn (theo config)
            decimal postingFeeRate = await _configRepo.GetDecimalAsync("posting_fee_rate", 0.01m);
            decimal refundFee = Math.Round(vehicle.Price * postingFeeRate, 0);

            // 3. Trừ Ví Tổng, cộng Ví Seller
            if (refundFee > 0)
            {
                var systemWallet = await _walletRepo.GetSystemWalletAsync();
                await _walletRepo.DeductBalanceAsync(systemWallet.WalletId, refundFee);
                await _walletRepo.CreatePaymentTransactionAsync(
                    systemWallet.WalletId, refundFee,
                    $"Hoàn phí đăng bài xe #{id} cho seller #{vehicle.SellerId} (bị từ chối)");

                var sellerWallet = await _walletRepo.GetByUserIdAsync(vehicle.SellerId);
                if (sellerWallet != null)
                {
                    await _walletRepo.AddBalanceAsync(sellerWallet.WalletId, refundFee);
                    await _walletRepo.CreatePaymentTransactionAsync(
                        sellerWallet.WalletId, refundFee,
                        $"Hoàn 100% phí đăng bài xe '{vehicle.Name}' — Admin từ chối", "success");
                }
            }

            // 4. Cập nhật status → rejected + ghi AdminNote
            await _repo.RejectAsync(id, note);
        }

        public async Task<AdminDashboardStatsDto> GetDashboardStatsAsync()
        {
            var stats = await _repo.GetDashboardStatsAsync();
            Wallet systemWallet = await _walletRepo.GetSystemWalletAsync();

            return new AdminDashboardStatsDto
            {
                TotalUsers = stats.totalUsers,

                TotalOrders = stats.totalOrders,
                TotalCompletedOrders = stats.totalCompletedOrders,
                TotalProcessingOrders = stats.totalProcessingOrders,

                TotalSoldVehicles = stats.totalSoldVehicles,
                TotalActiveVehicles = stats.totalActiveVehicles,
                TotalPendingVehicles = stats.totalPendingVehicles,
                TotalPendingInspectionVehicles = stats.totalPendingInspectionVehicles,
                TotalRejectedVehicles = stats.totalRejectedVehicles,

                TotalRevenueCompletedOrders = stats.totalRevenueCompletedOrders,
                SystemWalletBalance = systemWallet.Balance,

                GeneratedAt = DateTime.UtcNow
            };
        }
    }
}

