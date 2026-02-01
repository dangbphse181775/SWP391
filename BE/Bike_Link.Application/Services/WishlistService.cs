using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using Bike_Link.Infrastructure.Persitence.Repository;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.Services
{

    public class WishlistService : IWishlistService
    {
        private readonly IWishlistRepository _wishlistRepo;
        private readonly IWishlistItemRepository _wishlistItemRepo;
        private readonly IVehicleRepository _vehicleRepo;

        public WishlistService(IWishlistRepository wishlistRepo, IWishlistItemRepository wishlistItemRepo, IVehicleRepository vehicleRepo)
        {
            _wishlistRepo = wishlistRepo;
            _wishlistItemRepo = wishlistItemRepo;
            _vehicleRepo = vehicleRepo;
        }

        public async Task<WishlistDto> GetUserWishlistAsync(int userId)
        {
            Wishlist wishlist = await _wishlistRepo.GetUserWishlistAsync(userId);

            if (wishlist == null)
            {
                return null;
            }

            // Tìm các item không active để xóa
            List<WishlistItem> inactiveItems = wishlist.WishlistItems.Where(wi => wi.Vehicle != null && !string.Equals(wi.Vehicle.Status, "active", StringComparison.OrdinalIgnoreCase))
                .ToList();
            // Xóa các item không active
            foreach (WishlistItem item in inactiveItems)
            {
                await _wishlistItemRepo.RemoveWishlistItemAsync(item.WishlistId, item.VehicleId);
            }

            // Map từ Wishlist entity sang WishlistDto
            return new WishlistDto
            {
                WishlistId = wishlist.WishlistId,
                UserId = wishlist.UserId,
                WishlistItems = wishlist.WishlistItems.Select(wi => new WishlistItemDto
                {
                    WishlistId = wi.WishlistId,
                    VehicleId = wi.VehicleId,
                    CreatedAt = wi.CreatedAt
                }).ToList()
            };
        }

        public async Task<WishlistDto> CreateWishlistAsync(int userId)
        {
            Wishlist wishlist = new Wishlist
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            wishlist = await _wishlistRepo.CreateWishlistAsync(wishlist);
            return new WishlistDto
            {
                WishlistId = wishlist.WishlistId,
                UserId = wishlist.UserId,
                WishlistItems = new List<WishlistItemDto>()
            };
        }

        public async Task<WishlistItemDto> AddItemToWishlistAsync(int userId, int vehicleId)
        {
            // Lấy wishlist hiện tại của user
            Wishlist wishlist = await _wishlistRepo.GetUserWishlistAsync(userId);

            // Tạo wishlist item mới
            WishlistItem wishlistItem = new WishlistItem
            {
                WishlistId = wishlist.WishlistId,
                VehicleId = vehicleId,
                CreatedAt = DateTime.UtcNow
            };

            // Kiểm tra xem item đã tồn tại trong wishlist chưa
            WishlistItem existingItem = wishlist.WishlistItems.FirstOrDefault(wi => wi.VehicleId == vehicleId);
            if (existingItem != null)
            {
                throw new InvalidOperationException("Xe đạp đã có trong wishlist");
            }

            // Lấy thông tin vehicle để kiểm tra status
            Vehicle vehicle = await _vehicleRepo.GetByIdAsync(vehicleId, userId);
            if (vehicle == null)
            {
                throw new InvalidOperationException("Không tìm thấy xe đạp");
            }

            // Kiểm tra status phải là active
            if (!string.Equals(vehicle.Status, "active", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Chỉ có thể thêm xe đạp đang active vào wishlist");
            }

            // Thêm vào database
            WishlistItem addedItem = await _wishlistItemRepo.AddWishlistItemAsync(wishlistItem);

            // Map sang DTO và trả về
            return new WishlistItemDto
            {
                WishlistId = addedItem.WishlistId,
                VehicleId = addedItem.VehicleId,
                CreatedAt = addedItem.CreatedAt
            };
        }

        public async Task<bool> RemoveItemFromWishlistAsync(int userId, int vehicleId)
        {
            // Lấy wishlist hiện tại của user
            Wishlist wishlist = await _wishlistRepo.GetUserWishlistAsync(userId);

            // Xóa item với composite key (wishlistId, vehicleId)
            return await _wishlistItemRepo.RemoveWishlistItemAsync(wishlist.WishlistId, vehicleId);
        }
    }
}