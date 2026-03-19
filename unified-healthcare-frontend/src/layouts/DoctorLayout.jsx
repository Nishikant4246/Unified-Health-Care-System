import { useContext, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const navItems = [
  {
    to: "/doctor/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/doctor/search-patient",
    label: "Search Patient",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    to: "/doctor/add-record",
    label: "Add Record",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="13" x2="12" y2="17" />
        <line x1="10" y1="15" x2="14" y2="15" />
      </svg>
    ),
  },
  {
    to: "/doctor/my-records",
    label: "My Records",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
];

export default function DoctorLayout() {
  const { user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#0f1117" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col justify-between transition-all duration-300 flex-shrink-0"
        style={{
          width: collapsed ? "72px" : "240px",
          background: "#1a1d27",
          borderRight: "1px solid #2a2d3e",
        }}>
        <div>
          <div
            className="flex items-center gap-3 px-4 py-5"
            style={{ borderBottom: "1px solid #2a2d3e" }}>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#3b82f6" }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="white" />
              </svg>
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-bold" style={{ color: "#f1f5f9" }}>
                  UHCS Doctor
                </div>
                <div className="text-xs" style={{ color: "#3b82f6" }}>
                  Medical Portal
                </div>
              </div>
            )}
          </div>

          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={({ isActive }) => ({
                  background: isActive
                    ? "rgba(59,130,246,0.12)"
                    : "transparent",
                  color: isActive ? "#3b82f6" : "#94a3b8",
                  border: isActive
                    ? "1px solid rgba(59,130,246,0.2)"
                    : "1px solid transparent",
                })}>
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-3" style={{ borderTop: "1px solid #2a2d3e" }}>
          {!collapsed && (
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-lg mb-2"
              style={{ background: "#252837" }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: "#3b82f6", color: "white" }}>
                {user?.name?.[0]?.toUpperCase() || "D"}
              </div>
              <div className="min-w-0">
                <div
                  className="text-xs font-semibold truncate"
                  style={{ color: "#f1f5f9" }}>
                  {user?.name}
                </div>
                <div className="text-xs font-mono" style={{ color: "#3b82f6" }}>
                  {user?.uniqueId}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-sm transition-all"
            style={{ color: "#94a3b8" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.background = "transparent";
            }}>
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "#1a1d27", borderBottom: "1px solid #2a2d3e" }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg transition-all"
            style={{ color: "#94a3b8" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#252837")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }>
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              {
                collapsed ? (
                  <path d="M9 18l6-6-6-6" /> // → right arrow
                ) : (
                  <path d="M15 18l-6-6 6-6" />
                ) // ← left arrow
              }
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#3b82f6" }}
            />
            <span className="text-xs" style={{ color: "#94a3b8" }}>
              Doctor Portal Active
            </span>
          </div>
        </header>

        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: "#0f1117" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
