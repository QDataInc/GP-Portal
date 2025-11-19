// /src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Store JWT token
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const isAuthenticated = !!token;

  // ---------------------------------------------------------
  // SAVE JWT INTO SESSION STORAGE
  // ---------------------------------------------------------
  const loginWithToken = (jwtToken) => {
    sessionStorage.setItem("token", jwtToken);
    setToken(jwtToken);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.href = "/auth/start";
  };

  // ---------------------------------------------------------
  // LOAD USER PROFILE (OPTIONAL: only if backend supports it)
  // ---------------------------------------------------------
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;

      try {
        const res = await axiosClient.get("/api/profiles/me");
        setUser(res.data);
      } catch (err) {
        console.log("Profile load failed or token expired.");
      }
    };

    loadProfile();
  }, [token]);

  // ---------------------------------------------------------
  // AUTH HELPERS FOR OTP FLOW
  // ---------------------------------------------------------

  // 1) Check if email exists (Start page)
  const checkEmail = async (email) => {
    const res = await axiosClient.post("/api/auth/login-init", { email });
    return res.data.exists; // true/false
  };

  // 2) Validate password → triggers OTP sending
  const sendPassword = async (email, password) => {
    const res = await axiosClient.post("/api/auth/login-init", {
      email,
      password,
    });

    return res.data; // expect { message: "OTP sent" }
  };

  // 3) Verify OTP → returns JWT token
  const verifyOtp = async (email, otp) => {
    const res = await axiosClient.post("/api/auth/login-verify-otp", {
      email,
      otp,
    });

    const jwt = res.data?.access_token;
    if (jwt) loginWithToken(jwt);

    return jwt;
  };

  // ---------------------------------------------------------
  // 4) Register user (first/last/email/password)
  // ---------------------------------------------------------
  const registerUser = async (payload) => {
    const res = await axiosClient.post("/api/auth/register", payload);
    return res.data;
  };

  // ---------------------------------------------------------
  // EXPORT EVERYTHING
  // ---------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loginWithToken,
        logout,

        // NEW OTP FLOW HELPERS
        checkEmail,
        sendPassword,
        verifyOtp,
        registerUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
