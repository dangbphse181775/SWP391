using Bike_Link.Domain.Models;

namespace Bike_Link.Application.DTO;
public class WishlistDto()
{
    public int WishlistId { get; set; }
    public int UserId { get; set; }


    public ICollection<WishlistItemDto> WishlistItems { get; set; }
}

public class WishlistItemDto
{
    public int WishlistId { get; set; }
    public int VehicleId { get; set; }
    public DateTime? CreatedAt { get; set; }
}
