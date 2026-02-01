import axiosClient from './axiosClient';

export const productsApi = {
  getAllVehicles: async (params) => {
    try {
      const response = await axiosClient.get('/Public/vehicles', { params });
      return response; 
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },
};

export default productsApi;
