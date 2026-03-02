import axiosClient from "./axiosClient";

const WishlistAPI = {
  async getWishlist() {
    const response = await axiosClient.get("/Wishlist");
    // axiosClient interceptor returns `response.data` (server JSON).
    // Server may return either:
    // 1) { data: { wishlistId, wishlistItems }, message: '...' }
    // 2) { wishlistId, wishlistItems } (direct DTO)
    // Normalize payload so we can safely access wishlist items.
    const payload = response?.data ?? response;
    const wishlistItems = payload?.wishlistItems ?? payload?.WishlistItems ?? [];
    
    // Fetch vehicle details cho từng item
    const itemsWithDetails = await Promise.all(
      wishlistItems.map(async (item) => {
        try {
          // Try to get vehicle details. The public API may return a wrapped
          // object { data: vehicle, message } or the vehicle DTO directly.
          const vResp = await axiosClient.get(`/Public/vehicles/${item.vehicleId}`);
          const vPayload = vResp?.data ?? vResp;

          // media might be missing; guard with optional chaining
          const thumbnailUrl = vPayload?.media?.find(m => m.type === 'image')?.url || '/placeholder-bike.jpg';

          return {
            ...item,
            name: vPayload?.name ?? item.name,
            price: vPayload?.price ?? item.price,
            thumbnailUrl,
            description: vPayload?.description ?? item.description,
            brandName: vPayload?.brandName ?? item.brandName,
            categoryName: vPayload?.categoryName ?? item.categoryName,
            condition: vPayload?.condition ?? item.condition,
            model: vPayload?.model ?? item.model,
            frameSize: vPayload?.frameSize ?? item.frameSize,
            sellerName: vPayload?.sellerName ?? item.sellerName,
            isInspected: vPayload?.isInspected ?? item.isInspected,
            createdAt: vPayload?.createdAt ?? item.createdAt
          };
        } catch (err) {
          console.error(`Failed to fetch vehicle ${item.vehicleId}:`, err);
          // Trả NULL để lọc sau này
          return null;
        }
      })
    );
    
    return itemsWithDetails.filter(Boolean); // loại bỏ các null
  },

  getAllVehicles() {
    return axiosClient.get("/Public/vehicles");
  },

  getVehicleById(id) {
    return axiosClient.get(`/Public/vehicles/${id}`);
  },

  addWishlist(vehicleId) {
    return axiosClient.post(`/Wishlist/items/${vehicleId}`);
  },

  removeWishlist(vehicleId) {
    return axiosClient.delete(`/Wishlist/items/${vehicleId}`);
  },
};

export default WishlistAPI;
