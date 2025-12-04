// /src/api/axiosClient.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const axiosClient = axios.create({
  baseURL: API_BASE,
});

// ✅ Automatically attach JWT token
axiosClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;