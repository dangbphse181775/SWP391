using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;
using Bike_Link.Domain.IRepository;

namespace Bike_Link.Application.IService
{
    public interface IPublicVehicleService
    {
        Task<List<HomeVehicleDto>> SearchAsync(VehicleSearchOptions options);
    }
}
