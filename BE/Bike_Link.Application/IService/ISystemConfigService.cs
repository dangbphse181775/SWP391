using Bike_Link.Domain.Models;

namespace Bike_Link.Application.IService
{
    public interface ISystemConfigService
    {
        Task<List<SystemConfig>> GetAllAsync();
        Task<SystemConfig?> GetByKeyAsync(string key);
        Task UpdateAsync(string key, string value);
    }
}
