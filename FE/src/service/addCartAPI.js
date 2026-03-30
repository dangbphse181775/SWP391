import axiosClient from "./axiosClient";

const addCartAPI = {
  addToCart: (vehicleId) => {
    return axiosClient.post(`/Cart/items/${vehicleId}`);
  },
};

export default addCartAPI;