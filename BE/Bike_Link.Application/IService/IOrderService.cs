using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Application.DTO;

namespace Bike_Link.Application.IService
{
    public interface IOrderService
    {
        /// <summary>
        /// Thanh toán bằng ví — kiểm tra số dư, tạo Order, trừ ví
        /// </summary>
        Task<CheckoutResultDto> CheckoutAsync(int buyerId, CheckoutRequest request);
    }
}
