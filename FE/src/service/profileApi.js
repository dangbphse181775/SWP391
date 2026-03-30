import axiosClient from "./axiosClient";

const profileApi = {
    // Current user profile
    getProfile: () => {
        return axiosClient.get('/Profile/profile');
    },
    updateProfile: (data) => {
        return axiosClient.put('/Profile/profile', data);
    },
    updateAvatar: (data) => {
        return axiosClient.patch('/Profile/profile/avatar', data);
    },

    // Other user profiles (Admin/Inspector usage)
    getUserProfile: (userId) => {
        return axiosClient.get(`/Profile/profile/${userId}`);
    },
    updateUserProfile: (userId, data) => {
        return axiosClient.put(`/Profile/profile/${userId}`, data);
    },

    // User management (Admin usage)
    getUsers: (params) => {
        return axiosClient.get('/Profile/users', { params });
    },
    updateUserStatus: (userId, data) => {
        return axiosClient.patch(`/Profile/users/${userId}/status`, data);
    }
};

export default profileApi;
