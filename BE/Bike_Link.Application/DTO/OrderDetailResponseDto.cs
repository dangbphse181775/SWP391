using System;
using System.Collections.Generic;

namespace Bike_Link.Application.DTO
{
    public class OrderDetailResponseDto
    {
        public int OrderId { get; set; }
        
        // Buyer Info - Chỉ hiện FullName và Phone
        public string BuyerName { get; set; } = string.Empty;
        public string? BuyerPhone { get; set; }

        // Seller Info - Chỉ hiện FullName và Phone
        public string SellerName { get; set; } = string.Empty;
        public string? SellerPhone { get; set; }

        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal? DepositAmount { get; set; }

        public DateTime CreatedAt { get; set; }

        // Order Items
        public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();

        // Shipping Info - Chỉ hiện RecipientName, RecipientPhone, ShippingAddress và Note
        public OrderShippingDto? Shipping { get; set; }
    }

    public class OrderItemDto
    {
        public int VehicleId { get; set; }
        public string VehicleName { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Subtotal => Price * Quantity;
    }

    public class OrderShippingDto
    {
        public string RecipientName { get; set; }
        public string RecipientPhone { get; set; }
        public string ShippingAddress { get; set; }
        public string? Note { get; set; }
    }
}