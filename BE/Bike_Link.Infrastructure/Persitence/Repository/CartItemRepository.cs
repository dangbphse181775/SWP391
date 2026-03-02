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
    public class CartItemRepository : ICartItemRepository
    {
        private readonly BikeLinkContext _context;

        public CartItemRepository(BikeLinkContext context)
        {
            _context = context;
        }

        public async Task<ICollection<CartItem>> GetCartItemsAsync(int cartId)
        {
            // Lấy tất cả cart item có cartId tương ứng
            ICollection<CartItem> cartItems = _context.CartItems.Where(ci => ci.CartId == cartId).ToList();
            return cartItems;
        }

        public async Task<CartItem> AddCartItemAsync(CartItem cartItem)
        {
            // Thêm cart item vào DbSet và lưu thay đổi
            await _context.CartItems.AddAsync(cartItem); // EF Core function to add entity
            await _context.SaveChangesAsync();
            return cartItem;
        }

        public async Task<bool> RemoveCartItemAsync(int cartId, int vehicleId)
        {
            // Tìm cart item theo cartId và vehicleId
            CartItem cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.VehicleId == vehicleId);
            // Nếu không tìm thấy, trả về false
            if (cartItem == null)
            {
                return false;
            }
            // Nếu quantity > 1, giảm quantity đi 1
            if (cartItem.Quantity > 1)
            {
                cartItem.Quantity--;
                _context.CartItems.Update(cartItem);
            }
            else
            {
                // Nếu quantity = 1, xóa cart item khỏi giỏ hàng
                _context.CartItems.Remove(cartItem);
            }
            // Lưu thay đổi vào database
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task UpdateCartItemAsync(CartItem cartItem)
        {
            _context.CartItems.Update(cartItem);
            await _context.SaveChangesAsync();
        }
    }
}