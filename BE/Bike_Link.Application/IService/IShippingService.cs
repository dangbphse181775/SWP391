using Bike_Link.Application.DTO;

namespace Bike_Link.Application.IService;

public interface IShippingService
{
    Task<ShippingDto?> GetByOrderIdAsync(int orderId);
    Task<ShippingDto?> GetByIdAsync(int shippingId);
    Task<int> CreateAsync(int orderId, CreateShippingRequest request);
    Task UpdateAsync(int shippingId, UpdateShippingRequest request);
    Task UpdateByOrderIdAsync(int orderId, UpdateShippingRequest request);
    Task DeleteAsync(int shippingId);
    Task DeleteByOrderIdAsync(int orderId);
}