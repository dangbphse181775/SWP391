using System.Globalization;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Bike_Link.Infrastructure.Persitence.Repository;

namespace Bike_Link.Application.Services
{
    public class SellerService : ISellerService
    {
        private readonly IVehicleRepository _repo;
        private readonly Cloudinary _cloudinary;
        private readonly IWalletRepository _walletRepo;
        private readonly ISystemConfigRepository _configRepo;

        public SellerService(
            IVehicleRepository repo,
            Cloudinary cloudinary,
            IWalletRepository walletRepo,
            ISystemConfigRepository configRepo)
        {
            _repo = repo;
            _cloudinary = cloudinary;
            _walletRepo = walletRepo;
            _configRepo = configRepo;
        }

        public async Task<CreateVehicleResultDto> CreateVehicleAsync(CreateVehicleRequest req, int userId)
        {
            // 1. Đọc tỉ lệ phí đăng bài từ config (mặc định 1%)
            decimal postingFeeRate = await _configRepo.GetDecimalAsync("posting_fee_rate", 0.01m);
            decimal postingFee = Math.Round(req.Price * postingFeeRate, 0);

            // 2. Kiểm tra ví seller
            var wallet = await _walletRepo.GetByUserIdAsync(userId);
            if (wallet == null)
                throw new Exception("Bạn chưa có ví. Vui lòng liên hệ hỗ trợ.");

            if (wallet.Balance < postingFee)
            {
                return new CreateVehicleResultDto
                {
                    Success = false,
                    PostingFee = postingFee,
                    WalletBalance = wallet.Balance,
                    AmountShort = postingFee - wallet.Balance,
                    Message = $"Số dư ví không đủ. Cần nạp thêm {(postingFee - wallet.Balance):N0}đ để đăng bài (phí {postingFeeRate * 100:0.##}% giá xe = {postingFee:N0}đ)."
                };
            }

            // 3. Trừ ví seller
            bool deducted = await _walletRepo.DeductBalanceAsync(wallet.WalletId, postingFee);
            if (!deducted)
                throw new Exception("Số dư ví đã thay đổi. Vui lòng thử lại.");

            await _walletRepo.CreatePaymentTransactionAsync(
                wallet.WalletId, postingFee,
                $"Phí đăng bài xe '{req.Name}' ({postingFeeRate * 100:0.##}% giá xe)");

            // 4. Cộng vào Ví Tổng
            var systemWallet = await _walletRepo.GetSystemWalletAsync();
            await _walletRepo.AddBalanceAsync(systemWallet.WalletId, postingFee);
            await _walletRepo.CreatePaymentTransactionAsync(
                systemWallet.WalletId, postingFee,
                $"Nhận phí đăng bài từ seller #{userId} (xe: '{req.Name}')");

            // 5. Tạo vehicle
            var vehicle = new Vehicle
            {
                SellerId = userId,
                Name = req.Name,
                Description = req.Description,
                Price = req.Price,
                Condition = req.Condition,
                FrameSize = req.FrameSize,
                UsageHistory = req.UsageHistory,
                Model = req.Model,
                BrandId = req.BrandId,
                CategoryId = req.CategoryId,
                Status = "pending_admin",
                CreatedAt = DateTime.UtcNow
            };

            int vehicleId = await _repo.InsertVehicleAsync(vehicle);

            // Upload images
            if (req.Images != null)
            {
                foreach (var file in req.Images)
                {
                    using var stream = file.OpenReadStream();
                    var upload = await _cloudinary.UploadAsync(new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = "vehicles/images"
                    });

                    await _repo.InsertMediaAsync(vehicleId, "image", upload.SecureUrl.ToString());
                }
            }

            // Upload videos
            if (req.Videos != null)
            {
                foreach (var file in req.Videos)
                {
                    using var stream = file.OpenReadStream();
                    var upload = await _cloudinary.UploadAsync(new VideoUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = "vehicles/videos"
                    });

                    await _repo.InsertMediaAsync(vehicleId, "video", upload.SecureUrl.ToString());
                }
            }

            decimal newBalance = await _walletRepo.GetBalanceAsync(userId);

            return new CreateVehicleResultDto
            {
                Success = true,
                VehicleId = vehicleId,
                PostingFee = postingFee,
                WalletBalance = newBalance,
                Message = $"Đăng bài thành công! Đã trừ phí {postingFee:N0}đ ({postingFeeRate * 100:0.##}% giá xe). Bài đăng đang chờ admin duyệt."
            };
        }

        public async Task<List<VehicleListDto>> GetMyVehiclesAsync(int userId)
        {
            var vehicles = await _repo.GetBySellerAsync(userId);

            return vehicles.Select(v => new VehicleListDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Price = v.Price,
                Status = v.Status,
                IsInspected = v.IsInspected ?? false,
                CreatedAt = v.CreatedAt ?? DateTime.UtcNow
            }).ToList();
        }

        public async Task<VehicleDetailDto?> GetDetailAsync(int id, int userId)
        {
            var v = await _repo.GetByIdAsync(id, userId);
            if (v == null) return null;

            return new VehicleDetailDto
            {
                VehicleId = v.VehicleId,
                Name = v.Name,
                Description = v.Description,
                Price = v.Price,
                Condition = v.Condition,
                FrameSize = v.FrameSize,
                UsageHistory = v.UsageHistory,
                Model = v.Model,
                BrandId = v.BrandId,
                CategoryId = v.CategoryId,
                Status = v.Status,
                IsInspected = v.IsInspected ?? false,
                CreatedAt = v.CreatedAt ?? DateTime.UtcNow,
                UpdatedAt = v.UpdatedAt,
                Media = v.VehicleMedia.Select(m => new VehicleMediaDto
                {
                    MediaId = m.MediaId,
                    Type = m.Type ?? "image",
                    Url = m.Url
                }).ToList()
            };
        }

        public async Task UpdateAsync(int id, UpdateVehicleRequest req, int userId)
        {
            var v = new Vehicle
            {
                VehicleId = id,
                SellerId = userId,
                Name = req.Name,
                Description = req.Description,
                Price = req.Price,
                Condition = req.Condition,
                FrameSize = req.FrameSize,
                UsageHistory = req.UsageHistory,
                Model = req.Model,
                BrandId = req.BrandId,
                CategoryId = req.CategoryId,
                UpdatedAt = DateTime.UtcNow
            };

            await _repo.UpdateVehicleAsync(v);
        }

        public async Task HideAsync(int id, int userId)
        {
            await _repo.HideAsync(id, userId);
        }

        public async Task<RejectedVehicleDto?> GetRejectReasonAsync(
    int vehicleId,
    int userId)
        {
            var vehicle = await _repo.GetByIdAsync(vehicleId, userId);

            if (vehicle == null)
                return null;

            if (vehicle.Status != "rejected")
                throw new Exception("Bài đăng chưa bị từ chối");

            return new RejectedVehicleDto
            {
                VehicleId = vehicle.VehicleId,
                Name = vehicle.Name,
                AdminNote = vehicle.AdminNote
            };
        }

        public async Task<FeePreviewDto> GetFeePreviewAsync(decimal vehiclePrice)
        {
            decimal rate = await _configRepo.GetDecimalAsync("posting_fee_rate", 0.01m);
            decimal fee = Math.Round(vehiclePrice * rate, 0);

            return new FeePreviewDto
            {
                PostingFeeRate = rate,
                PostingFeeRatePct = $"{rate * 100:0.##}%",
                VehiclePrice = vehiclePrice,
                EstimatedFee = fee
            };
        }
    }
}
