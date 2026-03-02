using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class CartRepository : ICartRepository
    {
        private readonly BikeLinkContext _context;

        public CartRepository(BikeLinkContext context)
        {
            _context = context;
        }

        public async Task<Cart?> GetByUserIdAsync(int userId)
        {
            // Lấy cart của user theo userId, bao gồm CartItems và Vehicle
            return await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Vehicle)
                        .ThenInclude(v => v.VehicleMedia)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<Cart> CreateCartAsync(Cart cart)
        {
            // Thêm cart vào DbSet và lưu thay đổi
            await _context.Carts.AddAsync(cart); // EF Core function to add entity
            await _context.SaveChangesAsync();
            return cart;
        }
    }
}