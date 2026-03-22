import axiosClient from './axiosClient';

const vehicleDetailApi = {
    getVehicleDetail: async (vehicleId) => {
        let endpoint = `/Public/vehicles/${vehicleId}`;
        const path = window.location.pathname;
        if (path.includes('/seller/')) {
            endpoint = `/Seller/vehicles/${vehicleId}`;
        } else if (path.includes('/admin/')) {
            endpoint = `/Admin/vehicles/${vehicleId}`;
        }
        const res = await axiosClient.get(endpoint);
        return res;
    },

    getVehicleById: async (vehicleId) => {
        let endpoint = `/Public/vehicles/${vehicleId}`;
        const path = window.location.pathname;
        if (path.includes('/seller/')) {
            endpoint = `/Seller/vehicles/${vehicleId}`;
        } else if (path.includes('/admin/')) {
            endpoint = `/Admin/vehicles/${vehicleId}`;
        }
        const res = await axiosClient.get(endpoint);
        return res;
    },
};

export default vehicleDetailApi;
