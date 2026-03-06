using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class CheckoutRequest
    {
        /// <summary>
        /// Danh sách VehicleId muốn mua từ giỏ hàng
        /// </summary>
        public List<int> VehicleIds { get; set; } = new List<int>();
    }
}
