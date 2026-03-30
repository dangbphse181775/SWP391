using Bike_Link.Domain.Models;
using System.Threading.Tasks;

namespace Bike_Link.Domain.IRepository
{
    public interface ICartRepository
    {
        Task<Cart> GetByUserIdAsync(int userId);
        Task<Cart> CreateCartAsync(Cart cart);
    }
}