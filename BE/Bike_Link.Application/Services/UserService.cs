using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;

namespace Bike_Link.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;

        public UserService(IUserRepository repo)
        {
            _repo = repo;
        }

        public async Task UpgradeToSellerAsync(int userId, UpgradeToSellerRequest req)
        {
            if (await _repo.IsSellerAsync(userId))
                throw new InvalidOperationException("Bạn đã là Seller");

            var seller = new Seller
            {
                UserId = userId,
                ShopName = req.ShopName,
                Description = req.Description
            };

            await _repo.UpgradeToSellerAsync(seller);
        }
    }
}
