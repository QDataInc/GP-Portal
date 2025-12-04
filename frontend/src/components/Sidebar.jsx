import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Settings,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navLinks = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Investments", path: "/investments", icon: Briefcase },
  { name: "Documents", path: "/documents", icon: FileText },
  { name: "Profiles", path: "/profiles", icon: User },
  { name: "Deals", path: "/deals", icon: FileBarChart },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ open, toggle, collapsed, setCollapsed }) {
  const { role } = useAuth();
  const linksToRender = [...navLinks];

  // Add Admin sub-links if user is an Admin
  if (role === "Admin") {
    linksToRender.push({ name: "Admin: Documents", path: "/admin/documents", icon: FileText });
    linksToRender.push({ name: "Admin: Investments", path: "/admin/investments", icon: Briefcase });
    linksToRender.push({ name: "Admin: Profiles", path: "/admin/profiles", icon: User });
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        onClick={toggle}
        className={`fixed inset-0 bg-black/30 z-30 lg:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r shadow-sm z-40
          ${collapsed ? "w-20" : "w-64"}
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between h-16 border-b px-4">
          {!collapsed && (
            <h1 className="font-bold text-xl text-gray-800 tracking-tight">
              Victory GP
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            {collapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col gap-1 px-2">
          {linksToRender.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={18} />
              {!collapsed && <span>{name}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}