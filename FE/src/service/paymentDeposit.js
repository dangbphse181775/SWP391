import axiosClient from "./axiosClient";

const paymentAPI = {
  deposit: (amount) => {
    return axiosClient.post(`/payment/deposit`, {
      amount: amount,
    });
  },
};

export default paymentAPI;