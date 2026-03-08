using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Bike_Link.Infrastructure.Persitence.Repository;

public class ShippingRepository : IShippingRepository
{
    private readonly BikeLinkContext _context;

    public ShippingRepository(BikeLinkContext context)
    {
        _context = context;
    }

    // Lấy thông tin giao hàng theo orderId
    public async Task<Shipping?> GetByOrderIdAsync(int orderId)
    {
        return await _context.Shippings
            .FirstOrDefaultAsync(s => s.OrderId == orderId);
    }

    // Lấy thông tin giao hàng theo shippingId
    public async Task<Shipping?> GetByIdAsync(int shippingId)
    {
        return await _context.Shippings
            .FirstOrDefaultAsync(s => s.ShippingId == shippingId);
    }

    // Tạo mới thông tin giao hàng
    public async Task CreateAsync(Shipping shipping)
    {
        shipping.CreatedAt = DateTime.UtcNow;
        _context.Shippings.Add(shipping);
        await _context.SaveChangesAsync();
    }

    // Cập nhật thông tin giao hàng
    public async Task UpdateAsync(Shipping shipping)
    {
        _context.Shippings.Update(shipping);
        await _context.SaveChangesAsync();
    }


    // Xóa thông tin giao hàng theo shippingId
    public async Task DeleteAsync(int shippingId)
    {
        Shipping shipping = await _context.Shippings
            .FirstOrDefaultAsync(s => s.ShippingId == shippingId);

        if (shipping != null)
        {
            _context.Shippings.Remove(shipping);
            await _context.SaveChangesAsync();
        }
    }

    // Xóa thông tin giao hàng theo orderId
    public async Task DeleteByOrderIdAsync(int orderId)
    {
        Shipping shipping = await _context.Shippings
            .FirstOrDefaultAsync(s => s.OrderId == orderId);

        if (shipping != null)
        {
            _context.Shippings.Remove(shipping);
            await _context.SaveChangesAsync();
        }
    }

    // Kiểm tra xem đơn hàng đã có thông tin giao hàng chưa, tránh tạo trùng lặp
    public async Task<bool> ExistsByOrderIdAsync(int orderId)
    {
        return await _context.Shippings
            .AnyAsync(s => s.OrderId == orderId);
    }
}