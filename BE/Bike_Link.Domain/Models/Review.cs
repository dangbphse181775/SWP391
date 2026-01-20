using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Review
{
    public int ReviewId { get; set; }

    public int? OrderId { get; set; }

    public int? ReviewerId { get; set; }

    public int? TargetUserId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Order? Order { get; set; }

    public virtual User? Reviewer { get; set; }

    public virtual User? TargetUser { get; set; }
}
