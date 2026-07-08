import axios from "axios";
import { setupAxiosInterceptors } from "../interceptors/axiosInterceptor";

export const apiClient = axios.create({
  baseURL: "https://healthsync-backend-vs6n.onrender.com/api",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

setupAxiosInterceptors(apiClient);

export default apiClient;