import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on refresh ─────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    const loadUser = async () => {
      try {
        // /auth/me returns FULL user object including hospital, specialization etc.
        const res = await api.get("/auth/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));

        // Sliding session — swap the still-valid token for a fresh 7-day one,
        // so an active user is never logged out mid-use. Best effort only.
        try {
          const r = await api.get("/auth/refresh");
          if (r.data?.token) localStorage.setItem("token", r.data.token);
        } catch { /* keep the current token */ }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ── LOGIN ──────────────────────────────────────────────────
  const login = async (email, password) => {
    const res         = await api.post("/auth/login", { email, password });
    const { token }   = res.data;

    localStorage.setItem("token", token);

    // After login, fetch FULL user profile (includes hospital, specialization, location etc.)
    // so that DoctorDashboard and other pages have all fields available immediately
    const meRes = await api.get("/auth/me");
    const fullUser = meRes.data;

    localStorage.setItem("user", JSON.stringify(fullUser));
    setUser(fullUser);

    if (fullUser.role === "admin")   navigate("/admin/dashboard");
    else if (fullUser.role === "doctor") navigate("/doctor/dashboard");
    else navigate("/patient/dashboard");
  };

  // ── LOGOUT ─────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // ── Update user in context (after profile update / location set) ──
  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch {
      // silent fail
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};