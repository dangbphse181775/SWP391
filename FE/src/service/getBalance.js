import axiosClient from "./axiosClient";

const walletAPI = {
  getBalance: () => {
    return axiosClient.get(`/Wallet/balance`);
  },
};

export default walletAPI;