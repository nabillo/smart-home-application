import axios from 'axios';
import { useAuthStore } from './store/authStore';

const api = axios.create({
  baseURL: '/api/v1', // Updated to match server.js
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired, log the user out
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
