using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Order
{
    public int OrderId { get; set; }

    // FK -> users.user_id
    public int BuyerId { get; set; }

    // FK -> users.user_id
    public int SellerId { get; set; }

    public string Status { get; set; } = null!; // pending, paid, completed, cancelled...
    public decimal Amount { get; set; }
    public decimal? DepositAmount { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public virtual User Buyer { get; set; } = null!;
    public virtual User Seller { get; set; } = null!;

    public virtual ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}