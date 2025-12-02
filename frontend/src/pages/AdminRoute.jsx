// frontend/src/pages/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { token, role } = useAuth();

  // Not logged in → send to auth flow
  if (!token) {
    return <Navigate to="/auth/start" replace />;
  }

  // Logged in but not an Admin → send to normal dashboard
  if (role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Logged in AND Admin → allow access
  return children;
};

export default AdminRoute;
