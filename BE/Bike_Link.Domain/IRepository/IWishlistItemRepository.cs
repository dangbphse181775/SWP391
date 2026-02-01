using Bike_Link.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Domain.IRepository
{
    public interface IWishlistItemRepository
    {
        Task<ICollection<WishlistItem>> GetWishlistItemsAsync(int wishlistId);
        Task<WishlistItem> AddWishlistItemAsync(WishlistItem wishlistItem);
        Task<bool> RemoveWishlistItemAsync(int wishlistId, int vehicleId);
    }
}