// /src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Start from "./pages/auth/Start";
import Password from "./pages/auth/Password";
import Otp from "./pages/auth/Otp";
import Register from "./pages/auth/Register";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Investments from "./pages/Investments";
import Profiles from "./pages/Profiles";
import Settings from "./pages/Settings";
import Deals from "./pages/Deals";
import DealDetail from "./pages/DealDetail";

import AdminRoute from "./pages/AdminRoute";
import AdminDocumentsPage from "./pages/AdminDocumentsPage";
import AdminInvestmentsPage from "./pages/AdminInvestmentsPage";
import AdminInvestmentsSummary from "./pages/AdminInvestmentsSummary";
import AdminProfilesPage from "./pages/AdminProfilesPage";
import AdminProfileDetail from "./pages/AdminProfileDetail";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* PUBLIC AUTH ROUTES */}
          <Route path="/auth/start" element={<Start />} />
          <Route path="/auth/password" element={<Password />} />
          <Route path="/auth/otp" element={<Otp />} />
          <Route path="/auth/register" element={<Register />} />

          {/* PROTECTED APP ROUTES */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* ✅ Default landing after login */}
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="documents" element={<Documents />} />
            <Route path="investments" element={<Investments />} />
            <Route path="profiles" element={<Profiles />} />
            <Route path="settings" element={<Settings />} />

            {/* DEALS */}
            <Route path="deals" element={<Deals />} />
            <Route path="deals/:dealId" element={<DealDetail />} />

            {/* ADMIN ROUTES */}
            <Route
              path="admin/documents"
              element={
                <AdminRoute>
                  <AdminDocumentsPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/investments"
              element={
                <AdminRoute>
                  <AdminInvestmentsPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/investments/summary"
              element={
                <AdminRoute>
                  <AdminInvestmentsSummary />
                </AdminRoute>
              }
            />
            <Route
              path="admin/profiles"
              element={
                <AdminRoute>
                  <AdminProfilesPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/profiles/:id"
              element={
                <AdminRoute>
                  <AdminProfileDetail />
                </AdminRoute>
              }
            />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/auth/start" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
