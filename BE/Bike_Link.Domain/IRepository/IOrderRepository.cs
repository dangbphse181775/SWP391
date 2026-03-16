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

        /// <summary>
        /// Lấy Order theo OrderId
        /// </summary>
        Task<Order?> GetOrderByIdAsync(int orderId);

        /// <summary>
        /// Cập nhật trạng thái Order
        /// </summary>
        Task UpdateOrderStatusAsync(int orderId, string status);

        /// <summary>
        /// Lấy danh sách Order đặt cọc đã quá hạn 72h
        /// </summary>
        Task<List<Order>> GetExpiredDepositOrdersAsync();

        /// <summary>
        /// Lấy danh sách VehicleId từ OrderDetails của 1 Order
        /// </summary>
        Task<List<int>> GetVehicleIdsByOrderIdAsync(int orderId);

        Task<Order?> GetOrderDetailByIdAsync(int orderId);
        Task<List<Order>> GetOrdersByUserIdAsync(int userId, string role);
    }
}
