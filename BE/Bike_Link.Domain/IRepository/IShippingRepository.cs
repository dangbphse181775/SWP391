using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository;

public interface IShippingRepository
{
    Task<Shipping?> GetByOrderIdAsync(int orderId);
    Task<Shipping?> GetByIdAsync(int shippingId);
    Task CreateAsync(Shipping shipping);
    Task UpdateAsync(Shipping shipping);
    Task DeleteAsync(int shippingId);
    Task DeleteByOrderIdAsync(int orderId);
    Task<bool> ExistsByOrderIdAsync(int orderId);
}