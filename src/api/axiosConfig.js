import axios from "axios";

const PRODUCTION_API_ROOT = "https://bakery-management-system-production.up.railway.app";

function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
  if (fromEnv) return `${fromEnv}/api`;

  // Локальна розробка: Vite проксує /api → http://localhost:5023
  if (import.meta.env.DEV) return "/api";

  return `${PRODUCTION_API_ROOT}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;