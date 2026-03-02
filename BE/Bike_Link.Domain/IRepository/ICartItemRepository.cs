using Bike_Link.Domain.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Bike_Link.Domain.IRepository
{
    public interface ICartItemRepository
    {
        Task<ICollection<CartItem>> GetCartItemsAsync(int cartId);
        Task<CartItem> AddCartItemAsync(CartItem cartItem);
        Task<bool> RemoveCartItemAsync(int cartId, int vehicleId);
        Task UpdateCartItemAsync(CartItem cartItem);
    }
}