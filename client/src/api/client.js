import axios from "axios";

const TOKEN_KEY = "qp_admin_token";
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT automatically ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle expired / invalid token ──────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem(TOKEN_KEY);
      // Only redirect when currently inside the admin section
      if (window.location.pathname.startsWith("/dev-post")) {
        window.location.href = "/dev-post/login?reason=expired";
      }
    }

    return Promise.reject(error);
  }
);
