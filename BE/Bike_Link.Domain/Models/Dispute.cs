using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Dispute
{
    public int DisputeId { get; set; }

    // FK -> Order
    public int OrderId { get; set; }

    // FK -> User (người mở tranh chấp)
    public int OpenedByUserId { get; set; }

    public string? Description { get; set; }

    // open, investigating, resolved_refund, resolved_seller_win, resolved_partial
    public string? Status { get; set; }

    // JSON array các URL ảnh/video bằng chứng từ buyer
    public string? EvidenceUrls { get; set; }

    // Seller phản hồi / giải trình
    public string? SellerResponse { get; set; }

    // Ghi chú phán quyết của Admin/Inspector
    public string? AdminNote { get; set; }

    // refund_full | seller_win | partial_refund
    public string? Resolution { get; set; }

    // Số tiền hoàn cho buyer (nếu có)
    public decimal? RefundAmount { get; set; }

    // FK -> User (Admin/Inspector xử lý)
    public int? ResolvedByUserId { get; set; }

    public DateTime? CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    // Navigation
    public virtual Order Order { get; set; } = null!;
    public virtual User OpenedByUser { get; set; } = null!;
    public virtual User? ResolvedByUser { get; set; }
    public virtual ICollection<DisputeChat> DisputeChats { get; set; } = new List<DisputeChat>();
}
