import axiosClient from "./axiosClient";

const shippingApi = {
    getByOrderId: (orderId) => {
        return axiosClient.get(`/Shipping/order/${orderId}`);
    },
};

export default shippingApi;
