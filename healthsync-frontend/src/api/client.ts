import axios from 'axios';
import { setupAxiosInterceptors } from '../interceptors/axiosInterceptor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bind interceptors
setupAxiosInterceptors(apiClient);

export default apiClient;
