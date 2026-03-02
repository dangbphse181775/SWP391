using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Bike_Link.Infrastructure.Persitence.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bike_Link.Application.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepo;
        private readonly ICartItemRepository _cartItemRepo;
        private readonly IVehicleRepository _vehicleRepo;

        public CartService(ICartRepository cartRepo, ICartItemRepository cartItemRepo, IVehicleRepository vehicleRepo)
        {
            _cartRepo = cartRepo;
            _cartItemRepo = cartItemRepo;
            _vehicleRepo = vehicleRepo;
        }

        public async Task<CartDto> GetUserCartAsync(int userId)
        {
            Cart cart = await _cartRepo.GetByUserIdAsync(userId);

            if (cart == null)
            {
                return null;
            }

            // Tìm các item không active để xóa
            List<CartItem> inactiveItems = cart.CartItems.Where(ci => ci.Vehicle != null && !string.Equals(ci.Vehicle.Status, "active", StringComparison.OrdinalIgnoreCase))
                .ToList();
            
            // Xóa các item không active
            foreach (CartItem item in inactiveItems)
            {
                await _cartItemRepo.RemoveCartItemAsync(item.CartId, item.VehicleId);
            }

            // Map từ Cart entity sang CartDto
            return new CartDto
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                CartItems = cart.CartItems.Select(ci => new CartItemDto
                {
                    CartItemId = ci.CartItemId,
                    CartId = ci.CartId,
                    VehicleId = ci.VehicleId,
                    Quantity = ci.Quantity
                }).ToList()
            };
        }

        public async Task<CartDto> CreateCartAsync(int userId)
        {
            Cart cart = new Cart
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            cart = await _cartRepo.CreateCartAsync(cart);
            return new CartDto
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                CartItems = new List<CartItemDto>()
            };
        }

        public async Task<CartItemDto> AddItemToCartAsync(int userId, int vehicleId)
        {
            // Lấy cart hiện tại của user
            Cart cart = await _cartRepo.GetByUserIdAsync(userId);

            // Lấy thông tin vehicle để kiểm tra status
            Vehicle vehicle = await _vehicleRepo.GetByIdAsync(vehicleId);
            if (vehicle == null)
            {
                throw new InvalidOperationException("Không tìm thấy xe đạp");
            }

            // Kiểm tra status phải là active
            if (!string.Equals(vehicle.Status, "active", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Chỉ có thể thêm xe đạp đang active vào giỏ hàng");
            }

            // Kiểm tra xem item đã tồn tại trong cart chưa
            CartItem existingItem = cart.CartItems.FirstOrDefault(ci => ci.VehicleId == vehicleId);
            
            if (existingItem != null)
            {
                // Nếu đã tồn tại: Tăng quantity lên 1
                existingItem.Quantity += 1;
                // Cập nhật vào database
                await _cartItemRepo.UpdateCartItemAsync(existingItem);

                // Map sang DTO và trả về
                return new CartItemDto
                {
                    CartItemId = existingItem.CartItemId,
                    CartId = existingItem.CartId,
                    VehicleId = existingItem.VehicleId,
                    Quantity = existingItem.Quantity
                };
            }
            else
            {
                // Nếu chưa tồn tại: Tạo mới CartItem với quantity = 1
                CartItem cartItem = new CartItem
                {
                    CartId = cart.CartId,
                    VehicleId = vehicleId,
                    Quantity = 1,
                    CreatedAt = DateTime.UtcNow
                };

                // Thêm vào database
                CartItem addedItem = await _cartItemRepo.AddCartItemAsync(cartItem);

                // Map sang DTO và trả về
                return new CartItemDto
                {
                    CartItemId = addedItem.CartItemId,
                    CartId = addedItem.CartId,
                    VehicleId = addedItem.VehicleId,
                    Quantity = addedItem.Quantity
                };
            }
        }

        public async Task<bool> RemoveItemFromCartAsync(int userId, int vehicleId)
        {
            // Lấy cart hiện tại của user
            Cart cart = await _cartRepo.GetByUserIdAsync(userId);

            // Xóa item với composite key (cartId, vehicleId)
            return await _cartItemRepo.RemoveCartItemAsync(cart.CartId, vehicleId);
        }
    }
}