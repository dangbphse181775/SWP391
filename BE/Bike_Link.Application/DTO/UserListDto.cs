namespace Bike_Link.Application.DTO
{
    public class UserListDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Status { get; set; }
        public string? Role { get; set; }
        public int? TotalPurchases { get; set; }
        public decimal? BuyerRatingAvg { get; set; }
        public int? TotalSales { get; set; }
        public decimal? SellerRatingAvg { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}