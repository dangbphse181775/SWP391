namespace Bike_Link.Application.DTO;

public class ShippingDto
{
    public int ShippingId { get; set; }
    public int OrderId { get; set; }
    public string RecipientName { get; set; } = null!;
    public string RecipientPhone { get; set; } = null!;
    public string ShippingAddress { get; set; } = null!;
    public string? Note { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class CreateShippingRequest
{
    public string RecipientName { get; set; } = null!;
    public string RecipientPhone { get; set; } = null!;
    public string ShippingAddress { get; set; } = null!;
    public string? Note { get; set; }
}

public class UpdateShippingRequest
{
    public string RecipientName { get; set; } = null!;
    public string RecipientPhone { get; set; } = null!;
    public string ShippingAddress { get; set; } = null!;
    public string? Note { get; set; }
}