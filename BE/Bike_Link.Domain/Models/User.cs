using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;

    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }

    public int? RoleId { get; set; }
    public string? Status { get; set; }

    public int? TotalPurchases { get; set; }
    public decimal? BuyerRatingAvg { get; set; }

    public int? TotalSales { get; set; }
    public decimal? SellerRatingAvg { get; set; }

    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public virtual Role? Role { get; set; }

    public virtual Admin? Admin { get; set; }
    public virtual Inspector? Inspector { get; set; }

    // Orders: cùng một bảng users nhưng 2 vai trò khác nhau
    public virtual ICollection<Order> BuyOrders { get; set; } = new List<Order>();
    public virtual ICollection<Order> SellOrders { get; set; } = new List<Order>();

    public virtual ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();
    public virtual ICollection<InspectionReport> InspectionReports { get; set; } = new List<InspectionReport>();

    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();

    public virtual ICollection<Review> ReviewReviewers { get; set; } = new List<Review>();
    public virtual ICollection<Review> ReviewTargetUsers { get; set; } = new List<Review>();

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
}
