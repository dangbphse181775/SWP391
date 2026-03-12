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
        Task<CheckoutResultDto> CheckoutAsync(int buyerId, CheckoutRequest request);

        /// <summary>
        /// Đặt cọc 20% giá trị xe — trừ ví, tạo Order status="deposited", khóa xe thành "booked"
        /// </summary>
        Task<DepositResultDto> DepositAsync(int buyerId, DepositOrderRequest request);

        /// <summary>
        /// Hủy cọc trong vòng 72h — hoàn 95% tiền cọc, xe trở về "active"
        /// </summary>
        Task<CancelDepositResultDto> CancelDepositAsync(int buyerId, int orderId);

        /// <summary>
        /// Thanh toán khoản còn lại (80%) sau khi đặt cọc → order "processing"
        /// </summary>
        Task<PayRemainingResultDto> PayRemainingAsync(int buyerId, int orderId);

        /// <summary>
        /// Seller xác nhận đã giao xe → order "shipped"
        /// </summary>
        Task SellerConfirmShippedAsync(int sellerId, int orderId);

        /// <summary>
        /// Buyer xác nhận đã nhận hàng → order "completed", tiền Ví Tổng → Ví Seller
        /// </summary>
        Task BuyerConfirmReceivedAsync(int buyerId, int orderId);

        /// <summary>
        /// Xử lý các đơn cọc quá hạn 72h
        /// </summary>
        Task ProcessExpiredDepositsAsync();

        /// <summary>
        /// Lấy chi tiết đơn hàng theo OrderId
        /// </summary>
        Task<OrderDetailResponseDto?> GetOrderByOrderIdAsync(int orderId);
    }
}
