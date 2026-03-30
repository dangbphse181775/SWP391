using System;
using System.Collections.Generic;

namespace Bike_Link.Application.DTO
{
    public class OrderListDto
    {
        public int OrderId { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<OrderItemSummaryDto> Items { get; set; } = new List<OrderItemSummaryDto>();
    }

    public class OrderItemSummaryDto
    {
        public int VehicleId { get; set; }
        public string VehicleName { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public decimal Price { get; set; }
    }
}