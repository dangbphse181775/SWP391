using System;

namespace Bike_Link.Domain.Models;

public class DisputeChat
{
    public int DisputeChatId { get; set; }

    // FK -> Dispute
    public int DisputeId { get; set; }

    // FK -> User (người gửi)
    public int SenderId { get; set; }

    // "buyer" hoặc "seller" — kênh chat
    public string Channel { get; set; } = null!;

    public string Message { get; set; } = null!;

    // URL ảnh từ Cloudinary (nullable — chỉ có khi gửi ảnh)
    public string? ImageUrl { get; set; }

    public DateTime SentAt { get; set; }

    // Navigation
    public virtual Dispute Dispute { get; set; } = null!;
    public virtual User Sender { get; set; } = null!;
}
