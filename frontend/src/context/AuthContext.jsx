import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const isAuthenticated = !!token;

  // --- API methods ---
  const checkEmail = async (email) => {
    const res = await axiosClient.post("/api/auth/check-email", { email });
    return res.data.exists;
  };

  const register = async (first_name, last_name, email, password) => {
    await axiosClient.post("/api/auth/register", { first_name, last_name, email, password });
    await login(email, password);
  };

  const login = async (email, password) => {
    const res = await axiosClient.post("/api/auth/login", { email, password });
    const { access_token, user } = res.data;
    sessionStorage.setItem("token", access_token);
    setToken(access_token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await axiosClient.post("/api/auth/logout");
    } catch (_) {}
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    window.location.href = "/auth/start";
  };

  const value = {
    token,
    user,
    isAuthenticated,
    checkEmail,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
