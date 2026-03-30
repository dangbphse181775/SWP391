import axiosClient from "./axiosClient";

const withdrawAPI = {
  // Request a withdrawal
  withdraw: (data) => {
    return axiosClient.post(`/Wallet/withdraw`, {
      Amount: data.amount,
      BankName: data.bankName,
      BankAccountNumber: data.accountNumber,
      BankAccountName: data.accountHolder,
    });
  },

  // Get saved bank accounts of the current user
  getSavedAccounts: () => {
    return axiosClient.get(`/Wallet/saved-accounts`);
  },
};

export default withdrawAPI;
