using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository
{
    public interface IUserRepository
    {
        Task<bool> IsSellerAsync(int userId);
        Task UpgradeToSellerAsync(Seller seller);
    }
}
