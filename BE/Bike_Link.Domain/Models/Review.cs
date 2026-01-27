using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Review
{
    public int ReviewId { get; set; }

    // FK -> Order
    public int OrderId { get; set; }

    // FK -> User (người viết)
    public int ReviewerId { get; set; }

    // FK -> User (người bị đánh giá)
    public int TargetUserId { get; set; }

    public int Rating { get; set; }          // 1–5
    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    // Navigation
    public virtual Order Order { get; set; } = null!;
    public virtual User Reviewer { get; set; } = null!;
    public virtual User TargetUser { get; set; } = null!;
}