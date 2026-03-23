import axiosClient from './axiosClient';

export const productsApi = {
  
  getVehiclesBySeller: async (sellerId) => {
    try {
      const response = await axiosClient.get(`/Public/sellers/${sellerId}/vehicles`);
      return response;
    } catch (error) {
      console.error('Error fetching seller vehicles:', error);
      throw error;
    }
  },
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
