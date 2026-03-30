using System;

namespace Bike_Link.Application.DTO
{
    public class AdminDashboardStatsDto
    {
        public int TotalUsers { get; set; }

        public int TotalOrders { get; set; }
        public int TotalCompletedOrders { get; set; }
        public int TotalProcessingOrders { get; set; }

        public int TotalSoldVehicles { get; set; }
        public int TotalActiveVehicles { get; set; }
        public int TotalPendingVehicles { get; set; }
        public int TotalPendingInspectionVehicles { get; set; }
        public int TotalRejectedVehicles { get; set; }

        public decimal TotalRevenueCompletedOrders { get; set; }
        public decimal SystemWalletBalance { get; set; }

        public DateTime GeneratedAt { get; set; }
    }
}