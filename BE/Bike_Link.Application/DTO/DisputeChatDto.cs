namespace Bike_Link.Application.DTO
{
    public class DisputeChatDto
    {
        public int DisputeChatId { get; set; }
        public int SenderId { get; set; }
        public string? SenderName { get; set; }
        public string? SenderAvatar { get; set; }
        public string Channel { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public DateTime SentAt { get; set; }
    }
}
