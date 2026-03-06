using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bike_Link.Domain.Models;

namespace Bike_Link.Domain.IRepository
{
    public interface IOrderRepository
    {
        /// <summary>
        /// Tạo Order mới, trả về OrderId
        /// </summary>
        Task<int> CreateOrderAsync(Order order);

        /// <summary>
        /// Tạo OrderDetail
        /// </summary>
        Task CreateOrderDetailAsync(OrderDetail detail);

        /// <summary>
        /// Tạo Payment record
        /// </summary>
        Task CreatePaymentAsync(Payment payment);

        /// <summary>
        /// Cập nhật trạng thái vehicle (ví dụ: sold)
        /// </summary>
        Task UpdateVehicleStatusAsync(int vehicleId, string status);

        /// <summary>
        /// Xoá CartItem theo cartId + vehicleId (raw SQL, tránh EF tracking conflict)
        /// </summary>
        Task RemoveCartItemsAsync(int cartId, List<int> vehicleIds);
    }
}
