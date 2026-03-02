using Bike_Link.Application.DTO;
using System.Threading.Tasks;

namespace Bike_Link.Application.IService
{
    public interface ICartService
    {
        Task<CartDto> GetUserCartAsync(int userId);
        Task<CartDto> CreateCartAsync(int userId);
        Task<CartItemDto> AddItemToCartAsync(int userId, int vehicleId);
        Task<bool> RemoveItemFromCartAsync(int userId, int vehicleId);
    }
}