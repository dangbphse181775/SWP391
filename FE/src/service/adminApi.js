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
    }
};

export default adminApi;