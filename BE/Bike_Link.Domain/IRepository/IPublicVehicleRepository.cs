using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository
{
    public interface IPublicVehicleRepository
    {
        Task<List<Vehicle>> SearchAsync(VehicleSearchOptions options);
    }


    public class VehicleSearchOptions
    {
        public string? Keyword { get; set; }
        public int? BrandId { get; set; }
        public int? CategoryId { get; set; }
        public decimal? PriceFrom { get; set; }
        public decimal? PriceTo { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
