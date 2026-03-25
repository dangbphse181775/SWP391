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

  cancelDeposit: async (orderId) => {
    const response = await axiosClient.post(`/Order/cancel-deposit/${orderId}`);
    return response;
  },

  payRemaining: async (orderId) => {
    const response = await axiosClient.post(`/Order/pay-remaining/${orderId}`);
    return response;
  },

  confirmShipped: async (orderId, data) => {
    const response = await axiosClient.post(`/Order/confirm-shipped/${orderId}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  confirmReceived: async (orderId) => {
    const response = await axiosClient.post(`/Order/confirm-received/${orderId}`);
    return response;
  },

  processExpiredDeposits: async () => {
    const response = await axiosClient.post(`/Order/process-expired-deposits`);
    return response;
  },

  getById: async (orderId) => {
    const response = await axiosClient.get(`/Order/${orderId}`);
    return response;
  },

  getMyOrders: async () => {
    const response = await axiosClient.get(`/Order/user/order/buyer`);
    return response;
  },

  getMySellerOrders: async () => {
    const response = await axiosClient.get(`/Order/user/order/seller`);
    return response;
  },

  getByUserId: async (userId) => {
    const response = await axiosClient.get(`/Order/user/${userId}`);
    return response;
  },

  createShipping: async (orderId, data) => {
    const response = await axiosClient.post(`/Shipping/order/${orderId}`, data);
    return response;
  },
};

export default orderApi;
