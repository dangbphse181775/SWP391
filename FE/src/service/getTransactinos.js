import axiosClient from "./axiosClient";

const walletTransactionsAPI = {
  getTransactions: () => {
    return axiosClient.get("/Wallet/transactions");
  },
};

export default walletTransactionsAPI;
