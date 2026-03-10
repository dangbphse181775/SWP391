import axiosClient from './axiosClient';

const profileApi = {
  getProfile() {
    return axiosClient.get('/Profile/profile');
  },

  updateProfile(data) {
    return axiosClient.put('/Profile/profile', data);
  },

  updateAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosClient.patch('/Profile/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export default profileApi;