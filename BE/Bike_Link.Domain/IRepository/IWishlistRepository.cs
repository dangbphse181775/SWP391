using Bike_Link.Domain.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Bike_Link.Domain.IRepository
{
    public interface IWishlistRepository
    {
        Task<Wishlist> GetUserWishlistAsync(int userId);
        Task<Wishlist> CreateWishlistAsync(Wishlist wishlist);
    }
}