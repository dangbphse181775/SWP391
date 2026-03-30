import axiosClient from './axiosClient';

const reviewApi = {
  getByOrder: (orderId) => axiosClient.get(`/Review/order/${orderId}`),
  getByTargetUser: (userId) => axiosClient.get(`/Review/target/${userId}`),
  create: (data) => axiosClient.post('/Review', data),
  updateByOrder: (orderId, data) => axiosClient.put(`/Review/order/${orderId}`, data),
};

export default reviewApi;