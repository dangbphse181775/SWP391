using Bike_Link.Domain.Models;

namespace Bike_Link.Application.DTO;

public class CartDto
{
    public int CartId { get; set; }
    public int UserId { get; set; }
    public ICollection<CartItemDto> CartItems { get; set; } = new List<CartItemDto>();
}

public class CartItemDto
{
    public int CartItemId { get; set; }
    public int CartId { get; set; }
    public int VehicleId { get; set; }
    public int Quantity { get; set; }
}