import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request: attach the JWT automatically ────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response: end a dead session cleanly on 401 ──────────────
// If an authenticated request comes back 401 (token expired / invalid /
// revoked), the session is over — clear it and send the user to login.
// Auth calls (bad password on login/register) are left alone.
const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/register-doctor"];
const PUBLIC_PATHS = ["/", "/login", "/register", "/register-doctor"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const hadToken = !!localStorage.getItem("token");
    const isAuthCall = AUTH_PATHS.some((p) => url.includes(p));

    if (status === 401 && hadToken && !isAuthCall) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!PUBLIC_PATHS.includes(window.location.pathname)) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
