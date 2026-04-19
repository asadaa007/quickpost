import axios from "axios";

const TOKEN_KEY = "qp_admin_token";

/** Netlify/Railway: VITE_API_URL must be absolute (https://...). If the scheme is omitted, requests go to the Netlify origin and 404. */
function resolveApiBase() {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) return "http://localhost:5000/api";
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  return `https://${raw.replace(/^\/+/, "")}`.replace(/\/+$/, "");
}

const baseURL = resolveApiBase();

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
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password");

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
