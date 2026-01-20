using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int? BuyerId { get; set; }

    public int? SellerId { get; set; }

    public string? Status { get; set; }

    public decimal? Amount { get; set; }

    public decimal? DepositAmount { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User? Buyer { get; set; }

    public virtual ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User? Seller { get; set; }
}
