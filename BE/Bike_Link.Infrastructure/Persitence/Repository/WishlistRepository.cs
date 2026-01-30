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
    public class WishlistRepository : IWishlistRepository
    {
        private readonly BikeLinkContext _context;
        public WishlistRepository(BikeLinkContext context)
        {
            _context = context;
        }
        public async Task<Wishlist> GetUserWishlistAsync(int userId)
        {
            // Lấy wishlist của user (include WishlistItems để eager loading)
            Wishlist wishlist = await _context.Wishlists
                .Include(w => w.WishlistItems)
                .ThenInclude(wi => wi.Vehicle) // Include Vehicle trong WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId);

            return wishlist;
        }

        public async Task<Wishlist> CreateWishlistAsync(Wishlist wishlist)
        {
            wishlist.CreatedAt = DateTime.UtcNow;
            //Thêm Wishlist mới vào cơ sở dữ liệu
            await _context.Wishlists.AddAsync(wishlist); // insert into Wishlists values (...)
            await _context.SaveChangesAsync(); // update db]
            return wishlist;
        }



    }
}