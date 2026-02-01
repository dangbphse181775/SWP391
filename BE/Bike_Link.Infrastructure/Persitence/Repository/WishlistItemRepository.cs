using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Infrastructure.Persitence.Repository
{
    public class WishlistItemRepository : IWishlistItemRepository
    {
        private readonly BikeLinkContext _context;
        public WishlistItemRepository(BikeLinkContext context)
        {
            _context = context;
        }

        public async Task<ICollection<WishlistItem>> GetWishlistItemsAsync(int wishlistId)
        {
            // Lấy tất cả wishlist item có wishlistId tương ứng
            ICollection<WishlistItem> wishlistItems = _context.WishlistItems.Where(wi => wi.WishlistId == wishlistId).ToList();
            return wishlistItems;
        }
        public async Task<WishlistItem> AddWishlistItemAsync(WishlistItem wishlistItem)
        {
            // Thêm wishlist item vào DbSet và lưu thay đổi
            await _context.WishlistItems.AddAsync(wishlistItem); //EF Core function to add entity
            await _context.SaveChangesAsync();
            return wishlistItem;
        }

        public async Task<bool> RemoveWishlistItemAsync(int wishlistId, int vehicleId)
        {
            // FindAsync với composite key cần truyền đủ 2 tham số theo thứ tự khai báo trong HasKey
            //Tìm wishlist item theo wishlistId và vehicleId
            WishlistItem wishlistItem = await _context.WishlistItems.FindAsync(wishlistId, vehicleId);
            // Nếu không tìm thấy, trả về false
            if (wishlistItem == null)
            {
                return false;
            }
            // Xóa wishlist item khỏi DbSet và lưu thay đổi
            _context.WishlistItems.Remove(wishlistItem);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}