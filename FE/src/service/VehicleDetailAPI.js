import axiosClient from './axiosClient';

const vehicleDetailApi = {
    getVehicleById: async (vehicleId) => {
        const res = await axiosClient.get(`/Public/vehicles/${vehicleId}`);
        return res;
    },
};

export default vehicleDetailApi;
