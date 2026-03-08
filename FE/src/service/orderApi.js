import axiosClient from "./axiosClient";

const orderApi = {
  checkout: async (vehicleIds) => {
    const response = await axiosClient.post("/Order/checkout", { vehicleIds });
    return response;
  },

  deposit: async (vehicleId) => {
    const response = await axiosClient.post("/Order/deposit", { vehicleId });
    return response;
  },

  createShipping: async (orderId, data) => {
    const response = await axiosClient.post(`/Shipping/order/${orderId}`, data);
    return response;
  },
};

export default orderApi;
