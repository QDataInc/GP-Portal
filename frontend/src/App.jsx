import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import Documents from "./pages/Documents";
import Profiles from "./pages/Profiles";
import Deals from "./pages/Deals";
import Settings from "./pages/Settings";
import EmailGateModal from "./components/EmailGateModal";
import Register from "./pages/auth/Register";
import Signin from "./pages/auth/Signin";

function ProtectedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Not authenticated → show email modal
    return <EmailGateModal />;
  }

  // Authenticated → show dashboard & sidebar
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
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔓 Auth routes (public) */}
        <Route path="/auth/start" element={<EmailGateModal />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/signin" element={<Signin />} />

        {/* 🔒 Protected routes (require token) */}
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </Router>
  );
}
