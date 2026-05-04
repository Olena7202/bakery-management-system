import axios from "axios";

const baseURL = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_URL || "http://localhost:5023/api").replace(/\/$/, "");

const api = axios.create({
    baseURL: 'http://localhost:5023/api',
    
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
