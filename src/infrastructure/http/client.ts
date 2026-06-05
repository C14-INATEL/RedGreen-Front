import axios from 'axios';
import { config } from '../../config';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const IsUnauthorized = error.response?.status === 401;
    const HasToken = !!localStorage.getItem('token');

    if (IsUnauthorized && HasToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('session-expired'));
    }

    return Promise.reject(error);
  }
);
