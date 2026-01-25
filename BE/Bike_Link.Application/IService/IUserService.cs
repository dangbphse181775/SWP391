using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;

namespace Bike_Link.Application.IService
{
    public interface IUserService
    {
        Task UpgradeToSellerAsync(int userId, UpgradeToSellerRequest req);
    }
}
