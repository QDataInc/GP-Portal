// /src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Protected route wrapper (same logic as before)
import ProtectedRoute from "./components/ProtectedRoute";

// NEW AUTH PAGES
import Start from "./pages/auth/Start";
import Password from "./pages/auth/Password";
import Otp from "./pages/auth/Otp";
import Register from "./pages/auth/Register";


// APP LAYOUT + PAGES
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Investments from "./pages/Investments";
import Profiles from "./pages/Profiles";
import Settings from "./pages/Settings";
import Deals from "./pages/Deals";
import AdminRoute from "./pages/AdminRoute";
import AdminDocumentsPage from "./pages/AdminDocumentsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* DEFAULT REDIRECT */}
          <Route path="/" element={<Navigate to="/auth/start" replace />} />

          {/* PUBLIC AUTH ROUTES */}
          <Route path="/auth/start" element={<Start />} />
          <Route path="/auth/password" element={<Password />} />
          <Route path="/auth/otp" element={<Otp />} />
          <Route path="/auth/register" element={<Register />} />

          {/* PROTECTED APP ROUTES — wrapped exactly like your old structure */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="documents" element={<Documents />} />
            <Route path="investments" element={<Investments />} />
            <Route path="profiles" element={<Profiles />} />
            <Route path="settings" element={<Settings />} />
            <Route path="deals" element={<Deals />} />
              {/* ADMIN ROUTE – only Admins can see */}
            <Route
              path="admin/documents"
              element={
                <AdminRoute>
                  <AdminDocumentsPage />
                </AdminRoute>
              }
            />



          </Route>

          {/* FALLBACK — redirect unknown routes */}
          <Route path="*" element={<Navigate to="/auth/start" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
