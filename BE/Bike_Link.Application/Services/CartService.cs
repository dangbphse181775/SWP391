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

            // Không cho mua xe của chính mình
            if (vehicle.SellerId == userId)
            {
                throw new InvalidOperationException("Bạn không thể thêm xe đạp do chính mình đăng bán vào giỏ hàng");
            }

            // UPSERT: Nếu đã có trong giỏ thì giữ nguyên (xe cũ = 1 chiếc duy nhất)
            CartItem existingItem = cart.CartItems.FirstOrDefault(ci => ci.VehicleId == vehicleId);
            
            if (existingItem != null)
            {
                // Đã có trong giỏ → trả về luôn, không tăng quantity
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
                // Chưa có → thêm mới với quantity = 1
                CartItem cartItem = new CartItem
                {
                    CartId = cart.CartId,
                    VehicleId = vehicleId,
                    Quantity = 1,
                    CreatedAt = DateTime.UtcNow
                };

                CartItem addedItem = await _cartItemRepo.AddCartItemAsync(cartItem);

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