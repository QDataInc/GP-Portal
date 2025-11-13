// /src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const isAuthenticated = !!token;

  // ✅ Check if email exists
  const checkEmail = async (email) => {
    const res = await axiosClient.post("/api/auth/check-email", { email });
    return res.data.exists;
  };

  // ✅ Register then login
  const register = async (first_name, last_name, email, password) => {
    await axiosClient.post("/api/auth/register", {
      first_name,
      last_name,
      email,
      password,
    });
    await login(email, password);
  };

  // ✅ Login and save token
  const login = async (email, password) => {
    const res = await axiosClient.post("/api/auth/login", { email, password });

    const { access_token, user } = res.data;
    if (!access_token) throw new Error("Token missing in login response");

    sessionStorage.setItem("token", access_token);
    setToken(access_token);
    setUser(user);
  };

  // ✅ Logout and clear session
  const logout = async () => {
    try {
      await axiosClient.post("/api/auth/logout");
    } catch (_) {}
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    window.location.replace("/auth/start");
  };

  // ✅ Bootstrap user info on refresh (optional)
  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const res = await axiosClient.get("/api/auth/me");
          setUser(res.data);
        } catch {
          sessionStorage.clear();
          setToken(null);
        }
      }
    };
    fetchUser();
  }, [token]);

  const value = {
    token,
    user,
    isAuthenticated,
    checkEmail,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
