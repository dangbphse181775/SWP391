using Bike_Link.Application.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.IService
{
    public interface IWishlistService
    {
        Task<WishlistDto> GetUserWishlistAsync(int userId);
        Task<WishlistItemDto> AddItemToWishlistAsync(int userId, int vehicleId);
        Task<bool> RemoveItemFromWishlistAsync(int userId, int vehicleId);
    }
}