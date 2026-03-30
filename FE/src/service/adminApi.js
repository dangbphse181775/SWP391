import axiosClient from './axiosClient';

const adminApi = {
    // Get pending vehicles for approval
    getPendingVehicles() {
        const url = '/Admin/vehicles/pending';
        return axiosClient.get(url);
    },

    // Get vehicle detail for review
    getVehicleDetail(id) {
        const url = `/Admin/vehicles/${id}`;
        return axiosClient.get(url);
    },

    // Approve vehicle
    approveVehicle(id) {
        const url = `/Admin/vehicles/${id}/approve`;
        return axiosClient.post(url);
    },

    // Reject vehicle with admin note
    rejectVehicle(id, adminNote) {
        const url = `/Admin/vehicles/${id}/reject`;
        return axiosClient.post(url, { adminNote });
    },

    // Get dashboard overview stats
    getDashboardOverview() {
        return axiosClient.get('/Admin/dashboard/overview');
    },

    // Get system wallet balance (admin only)
    getSystemWalletBalance() {
        return axiosClient.get('/Wallet/system/balance');
    },

    // Get system wallet transactions (admin only)
    getSystemWalletTransactions() {
        return axiosClient.get('/Wallet/system/transactions');
    },

    // Get all system configs (admin only)
    getSystemConfigs() {
        return axiosClient.get('/SystemConfig');
    },

    // Update a system config by key (admin only)
    updateSystemConfig(key, value) {
        return axiosClient.put(`/SystemConfig/${key}`, { value });
    },

    // Get all pending withdrawal requests (admin only)
    getPendingWithdrawals() {
        return axiosClient.get('/Wallet/withdraw/pending');
    },

    // Approve a withdrawal request (backend: HttpPut)
    approveWithdrawal(id) {
        return axiosClient.put(`/Wallet/withdraw/${id}/approve`);
    },

    // Reject a withdrawal request (backend: HttpPut)
    rejectWithdrawal(id) {
        return axiosClient.put(`/Wallet/withdraw/${id}/reject`);
    },

    // Get user profile by userId (to resolve name from withdrawal list)
    getUserProfile(userId) {
        return axiosClient.get(`/Profile/profile/${userId}`);
    }
};

export default adminApi;