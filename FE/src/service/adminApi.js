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
    }
};

export default adminApi;