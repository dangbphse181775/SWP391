import axios from 'axios';
import { getAccessToken, logout as authLogout } from './auth';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(async (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error?.response?.status === 401) {
      authLogout(); // Clears both session and local storage
      // Avoid redirect loop if already on login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
