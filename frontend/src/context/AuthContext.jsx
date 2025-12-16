// /src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Store JWT token
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [user, setUser] = useState(null);

  // NEW: store role from JWT
  const [role, setRole] = useState(null);

  // ✅ NEW: auth hydration/loading flag
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token;

  // ---------------------------------------------------------
  // INITIAL HYDRATE TOKEN FROM SESSION STORAGE (ONCE)
  // ---------------------------------------------------------
  useEffect(() => {
    const stored = sessionStorage.getItem("token");
    if (stored && !token) {
      setToken(stored);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setRole(null);
    window.location.href = "/auth/start";
  };

  // ---------------------------------------------------------
  // DECODE ROLE FROM JWT
  // ---------------------------------------------------------
  useEffect(() => {
    if (!token) {
      setRole(null);
      return;
    }

    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = JSON.parse(atob(payloadBase64));
      setRole(payloadJson.role || null);
    } catch (err) {
      console.error("Failed to decode JWT role:", err);
      setRole(null);
    }
  }, [token]);

  // ---------------------------------------------------------
  // LOAD USER PROFILE (OPTIONAL)
  // ---------------------------------------------------------
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;

      try {
        const res = await axiosClient.get("/api/profiles/me");
        setUser(res.data);
      } catch (err) {
        // ✅ IMPORTANT: do NOT log user out here.
        // If profile fails due to backend issue, keep token and allow app to run.
        console.log("Profile load failed or token expired.");
      }
    };

    loadProfile();
  }, [token]);

  // ---------------------------------------------------------
  // AUTH HELPERS FOR OTP FLOW
  // ---------------------------------------------------------

  // 1) Validate email (start)
  const checkEmail = async (email) => {
    const res = await axiosClient.post("/api/auth/login-init", { email });
    return res.data.exists;
  };

  // 2) Password validation triggers OTP send
  const sendPassword = async (email, password) => {
    const res = await axiosClient.post("/api/auth/login-init", {
      email,
      password,
    });

    return res.data;
  };

  // 3) Verify OTP → returns JWT
  const verifyOtp = async (email, otp) => {
    const res = await axiosClient.post("/api/auth/login-verify-otp", {
      email,
      otp,
    });

    const jwt = res.data?.access_token;
    if (jwt) {
      loginWithToken(jwt);
    }

    return jwt;
  };

  // 4) Register user
  const registerUser = async (payload) => {
    const res = await axiosClient.post("/api/auth/register", payload);
    return res.data;
  };

  // ---------------------------------------------------------
  // EXPORT TO APP
  // ---------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated,
        isLoading, // ✅ NEW
        loginWithToken,
        logout,

        // OTP login flow
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
