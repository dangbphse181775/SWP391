using System.Globalization;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;

namespace Bike_Link.Application.Services
{
    public class SystemConfigService : ISystemConfigService
    {
        private readonly ISystemConfigRepository _repo;

        public SystemConfigService(ISystemConfigRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<SystemConfig>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<SystemConfig?> GetByKeyAsync(string key)
        {
            return await _repo.GetByKeyAsync(key);
        }

        public async Task UpdateAsync(string key, string value)
        {
            // Validate giá trị trước khi lưu
            var config = await _repo.GetByKeyAsync(key);
            if (config == null)
                throw new Exception($"Config key '{key}' không tồn tại");

            // Validate dựa theo loại key
            if (key.EndsWith("_rate"))
            {
                if (!decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var rate))
                    throw new Exception($"Giá trị '{value}' không hợp lệ. Phải là số thập phân (vd: 0.20)");

                if (rate < 0 || rate > 1)
                    throw new Exception($"Tỉ lệ phải trong khoảng 0 đến 1 (vd: 0.20 = 20%)");
            }
            else if (key.EndsWith("_hours"))
            {
                if (!int.TryParse(value, out var hours) || hours <= 0)
                    throw new Exception($"Giá trị '{value}' không hợp lệ. Phải là số nguyên dương");
            }

            await _repo.UpdateAsync(key, value, GenerateDescription(key, value));
        }

        private string? GenerateDescription(string key, string value)
        {
            if (key.EndsWith("_rate") &&
                decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var rate))
            {
                string pct = (rate * 100).ToString("0.##") + "%";
                return key switch
                {
                    "deposit_rate" => $"Tỉ lệ đặt cọc ({pct})",
                    "cancel_refund_rate" => $"Tỉ lệ hoàn tiền khi hủy cọc ({pct})",
                    "expired_seller_rate" => $"Tỉ lệ seller nhận khi cọc quá hạn ({pct})",
                    _ => null
                };
            }

            if (key == "deposit_expiry_hours")
                return $"Thời hạn đặt cọc ({value} giờ)";

            return null;
        }
    }
}
