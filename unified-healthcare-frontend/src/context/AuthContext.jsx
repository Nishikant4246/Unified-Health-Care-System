import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on refresh
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {

        const res = await api.get("/auth/me");

        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));

      } catch (error) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);

      } finally {

        setLoading(false);

      }
    };

    loadUser();

  }, []);

  // LOGIN
  const login = async (email, password) => {

    const res = await api.post("/auth/login", { email, password });

    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);

    if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "doctor") navigate("/doctor/dashboard");
    else navigate("/patient/dashboard");
  };

  // LOGOUT
  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/");

  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};