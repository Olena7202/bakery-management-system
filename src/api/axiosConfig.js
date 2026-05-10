import axios from "axios";

const baseURL = import.meta.env.DEV
  ? "/api"
  : `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: baseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;