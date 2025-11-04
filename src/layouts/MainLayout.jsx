import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  const [open, setOpen] = useState(false);        // mobile sidebar
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const toggle = () => setOpen(!open);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        open={open}
        toggle={toggle}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main area shifts based on sidebar width */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Header toggle={toggle} />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
