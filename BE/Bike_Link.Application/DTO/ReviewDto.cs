namespace Bike_Link.Application.DTO;

public class ReviewDto
{
    public int ReviewId { get; set; }
    public int OrderId { get; set; }
    public string ReviewerName { get; set; } = null!;
    public string TargetUserName { get; set; } = null!;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class CreateReviewRequest
{
    public int OrderId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class UpdateReviewRequest
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
}