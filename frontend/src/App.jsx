import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";

// --- Protected pages ---
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import Documents from "./pages/Documents";
import Profiles from "./pages/Profiles";
import Deals from "./pages/Deals";
import Settings from "./pages/Settings";

// --- Auth & Components ---
import EmailGateModal from "./components/EmailGateModal";
import Register from "./pages/auth/Register";
import Signin from "./pages/auth/Signin";

function ProtectedApp() {
  const { isAuthenticated } = useAuth();

  // 🔒 If not authenticated, show Email Modal instead of content
  if (!isAuthenticated) {
    return <EmailGateModal />;
  }

  // ✅ Authenticated → render full dashboard layout
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/settings" element={<Settings />} />
        {/* Fallback unknown paths → dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔓 Public routes */}
        <Route path="/auth/start" element={<EmailGateModal />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/signin" element={<Signin />} />

        {/* 🔒 Protected routes */}
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </Router>
  );
}
