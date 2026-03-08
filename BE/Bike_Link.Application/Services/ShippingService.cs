using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using System.Text.RegularExpressions;

namespace Bike_Link.Application.Services;

public class ShippingService : IShippingService
{
    private readonly IShippingRepository _shippingRepo;

    public ShippingService(IShippingRepository shippingRepo)
    {
        _shippingRepo = shippingRepo;
    }

    // Lấy thông tin giao hàng theo orderId
    public async Task<ShippingDto?> GetByOrderIdAsync(int orderId)
    {
        // Lấy thông tin giao hàng theo orderId, nếu không có thì trả về null
        Shipping shipping = await _shippingRepo.GetByOrderIdAsync(orderId);

        if (shipping == null)
            return null;

        // Mapping từ Shipping sang ShippingDto
        return new ShippingDto
        {
            ShippingId = shipping.ShippingId,
            OrderId = shipping.OrderId,
            RecipientName = shipping.RecipientName,
            RecipientPhone = shipping.RecipientPhone,
            ShippingAddress = shipping.ShippingAddress,
            Note = shipping.Note,
            CreatedAt = shipping.CreatedAt
        };
    }

    // Lấy thông tin giao hàng theo shippingId
    public async Task<ShippingDto?> GetByIdAsync(int shippingId)
    {
        // Lấy thông tin giao hàng theo shippingId, nếu không có thì trả về null
        Shipping shipping = await _shippingRepo.GetByIdAsync(shippingId);

        if (shipping == null)
            return null;

        // Mapping từ Shipping sang ShippingDto
        return new ShippingDto
        {
            ShippingId = shipping.ShippingId,
            OrderId = shipping.OrderId,
            RecipientName = shipping.RecipientName,
            RecipientPhone = shipping.RecipientPhone,
            ShippingAddress = shipping.ShippingAddress,
            Note = shipping.Note,
            CreatedAt = shipping.CreatedAt
        };
    }

    // Tạo thông tin giao hàng mới cho một đơn hàng
    public async Task<int> CreateAsync(int orderId, CreateShippingRequest request)
    {
        // Kiểm tra xem order đã có shipping chưa
        bool exists = await _shippingRepo.ExistsByOrderIdAsync(orderId);
        if (exists)
            throw new Exception("Đơn hàng này đã có thông tin giao hàng");

        // Validate RecipientName
        ValidateRecipientName(request.RecipientName);

        // Validate RecipientPhone
        ValidateRecipientPhone(request.RecipientPhone);

        // Tạo thông tin giao hàng mới từ request của user
        Shipping shipping = new Shipping
        {
            OrderId = orderId,
            RecipientName = request.RecipientName.Trim(),
            RecipientPhone = request.RecipientPhone,
            ShippingAddress = request.ShippingAddress.Trim(),
            Note = request.Note?.Trim()
        };

        // Lưu thông tin giao hàng vào database
        await _shippingRepo.CreateAsync(shipping);

        return shipping.ShippingId;
    }

    // Cập nhật thông tin giao hàng theo shippingId
    public async Task UpdateAsync(int shippingId, UpdateShippingRequest request)
    {
        // Lấy thông tin giao hàng theo shippingId
        Shipping shipping = await _shippingRepo.GetByIdAsync(shippingId);

        if (shipping == null)
            throw new Exception("Không tìm thấy thông tin giao hàng");

        // Validate RecipientName
        ValidateRecipientName(request.RecipientName);

        // Validate RecipientPhone
        ValidateRecipientPhone(request.RecipientPhone);

        // Cập nhật thông tin giao hàng từ request của user
        shipping.RecipientName = request.RecipientName.Trim();
        shipping.RecipientPhone = request.RecipientPhone;
        shipping.ShippingAddress = request.ShippingAddress.Trim();
        shipping.Note = request.Note?.Trim();

        // Lưu thông tin giao hàng đã được cập nhật vào database
        await _shippingRepo.UpdateAsync(shipping);
    }

    // Cập nhật thông tin giao hàng theo orderId
    public async Task UpdateByOrderIdAsync(int orderId, UpdateShippingRequest request)
    {
        // Lấy thông tin giao hàng theo orderId
        Shipping shipping = await _shippingRepo.GetByOrderIdAsync(orderId);

        if (shipping == null)
            throw new Exception("Không tìm thấy thông tin giao hàng");

        // Validate RecipientName
        ValidateRecipientName(request.RecipientName);

        // Validate RecipientPhone
        ValidateRecipientPhone(request.RecipientPhone);

        // Cập nhật thông tin giao hàng từ request của user
        shipping.RecipientName = request.RecipientName.Trim();
        shipping.RecipientPhone = request.RecipientPhone;
        shipping.ShippingAddress = request.ShippingAddress.Trim();
        shipping.Note = request.Note?.Trim();

        // Lưu thông tin giao hàng đã được cập nhật vào database
        await _shippingRepo.UpdateAsync(shipping);
    }

    // Xóa thông tin giao hàng theo shippingId
    public async Task DeleteAsync(int shippingId)
    {
        // Lấy thông tin giao hàng theo shippingId
        Shipping shipping = await _shippingRepo.GetByIdAsync(shippingId);

        if (shipping == null)
            throw new Exception("Không tìm thấy thông tin giao hàng");

        // Xóa thông tin giao hàng khỏi database
        await _shippingRepo.DeleteAsync(shippingId);
    }

    // Xóa thông tin giao hàng theo orderId
    public async Task DeleteByOrderIdAsync(int orderId)
    {
        // Lấy thông tin giao hàng theo orderId
        Shipping shipping = await _shippingRepo.GetByOrderIdAsync(orderId);

        if (shipping == null)
            throw new Exception("Không tìm thấy thông tin giao hàng");

        // Xóa thông tin giao hàng khỏi database
        await _shippingRepo.DeleteByOrderIdAsync(orderId);
    }

    // Private helper methods for validation
    private void ValidateRecipientName(string recipientName)
    {
        if (string.IsNullOrWhiteSpace(recipientName))
            throw new ArgumentException("Tên người nhận không được để trống");

        if (recipientName.Trim().Length < 2)
            throw new ArgumentException("Tên người nhận phải có ít nhất 2 ký tự");

        if (recipientName.Length > 100)
            throw new ArgumentException("Tên người nhận không được vượt quá 100 ký tự");
    }

    private void ValidateRecipientPhone(string recipientPhone)
    {
        if (string.IsNullOrWhiteSpace(recipientPhone))
            throw new ArgumentException("Số điện thoại người nhận không được để trống");

        string phonePattern = @"^0\d{9}$";
        if (!Regex.IsMatch(recipientPhone, phonePattern))
            throw new ArgumentException("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0");
    }
}