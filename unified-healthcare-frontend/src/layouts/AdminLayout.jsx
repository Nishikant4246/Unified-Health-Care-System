import { useContext, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: "/admin/doctors",
    label: "Doctors",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    to: "/admin/pending-doctors",
    label: "Approvals",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    badge: true,
  },
  {
    to: "/admin/patients",
    label: "Patients",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f1117' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col justify-between transition-all duration-300 flex-shrink-0"
        style={{
          width: collapsed ? '72px' : '240px',
          background: '#1a1d27',
          borderRight: '1px solid #2a2d3e',
        }}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid #2a2d3e' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#10b981' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="white"/>
              </svg>
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-bold" style={{ color: '#f1f5f9' }}>UHCS Admin</div>
                <div className="text-xs" style={{ color: '#10b981' }}>Control Panel</div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group"
                style={({ isActive }) => ({
                  background: isActive ? 'rgba(16,185,129,0.12)' : 'transparent',
                  color: isActive ? '#10b981' : '#94a3b8',
                  border: isActive ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                })}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                    •
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="p-3" style={{ borderTop: '1px solid #2a2d3e' }}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-2"
              style={{ background: '#252837' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: '#10b981', color: 'white' }}>
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: '#f1f5f9' }}>{user?.name}</div>
                <div className="text-xs" style={{ color: '#94a3b8' }}>Administrator</div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-sm transition-all"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: '#1a1d27', borderBottom: '1px solid #2a2d3e' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg transition-all"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#252837'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
            <span className="text-xs" style={{ color: '#94a3b8' }}>System Online</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: '#0f1117' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}