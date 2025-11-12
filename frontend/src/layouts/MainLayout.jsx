import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function MainLayout({ children }) {
  const [open, setOpen] = useState(false);          // mobile sidebar
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const { logout, isAuthenticated } = useAuth();

  const toggle = () => setOpen(!open);

  if (!isAuthenticated) return null; // prevent flash of layout when logged out

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        open={open}
        toggle={toggle}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Header + Logout */}
        <div className="flex justify-between items-center px-6 py-4 bg-white border-b shadow-sm">
          <Header toggle={toggle} />
          {isAuthenticated && (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
