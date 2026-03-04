import axiosClient from "./axiosClient";

const cartAPI = {
  getCart: async () => {
    const response = await axiosClient.get("/Cart");
    return response;
  },

  deleteCartItem: async (vehicleId) => {
    const response = await axiosClient.delete(`/Cart/items/${vehicleId}`);
    return response;
  },

  removeFromCart: async (vehicleId) => {
    const response = await axiosClient.delete(`/Cart/items/${vehicleId}`);
    return response;
  },
};

export default cartAPI;