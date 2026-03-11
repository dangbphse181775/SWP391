using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository
{
    public interface ISystemConfigRepository
    {
        /// <summary>
        /// Lấy tất cả config
        /// </summary>
        Task<List<SystemConfig>> GetAllAsync();

        /// <summary>
        /// Lấy giá trị config theo key
        /// </summary>
        Task<SystemConfig?> GetByKeyAsync(string key);

        /// <summary>
        /// Cập nhật giá trị config
        /// </summary>
        Task UpdateAsync(string key, string value, string? description = null);

        /// <summary>
        /// Lấy giá trị decimal theo key (mặc định nếu không tìm thấy)
        /// </summary>
        Task<decimal> GetDecimalAsync(string key, decimal defaultValue);

        /// <summary>
        /// Lấy giá trị int theo key (mặc định nếu không tìm thấy)
        /// </summary>
        Task<int> GetIntAsync(string key, int defaultValue);
    }
}
