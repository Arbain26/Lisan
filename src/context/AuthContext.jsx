import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

import api from "../services/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("lisan_admin_token");
      const storedUser = localStorage.getItem("lisan_admin_user");
      
      if (token) {
        try {
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          // Verify with backend to ensure session is genuinely valid
          const res = await api.get("/auth/me");
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem("lisan_admin_user", JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn("Session verification failed, logging out:", err.message);
          localStorage.removeItem("lisan_admin_token");
          localStorage.removeItem("lisan_admin_user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data;

      localStorage.setItem("lisan_admin_token", data.token);
      localStorage.setItem("lisan_admin_user", JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Login gagal";
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("lisan_admin_token");
    localStorage.removeItem("lisan_admin_user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
