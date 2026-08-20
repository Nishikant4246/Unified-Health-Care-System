import { useContext, useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { to: "/doctor/dashboard", label: "Dashboard", labelKey: "dashboard", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to: "/doctor/search-patient", label: "Search Patient", labelKey: "searchPatient", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { to: "/doctor/add-record", label: "Add Record", labelKey: "addRecord", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/></svg> },
  { to: "/doctor/my-records", label: "My Records", labelKey: "myRecords", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg> },
  { to: "/doctor/patients", label: "My Patients", labelKey: "myPatients", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
];

const ACCENT = "#3b82f6";
const GOLD   = "#C9A84C";

function SidebarContent({ user, logout, collapsed, onNavClick }) {
  const { t } = useLanguage();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Gold top bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#A07830,#C9A84C,#F0D98C,#C9A84C,#A07830)", flexShrink: 0 }} />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px", borderBottom: "1px solid #1A2E45", flexShrink: 0 }}>
        <div className="dashboard-logo-mark" style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="white"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>UHCS</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: GOLD }}>Doctor Portal</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: "10px 10px", flex: 1, overflowY: "auto" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            title={collapsed ? item.label : ""}
            className="dashboard-nav-link"
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 10, marginBottom: 2,
              fontSize: 13, fontWeight: 500, textDecoration: "none",
              background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
              color: isActive ? ACCENT : "var(--text-secondary)",
              border: isActive ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
              transition: "all 0.15s",
            })}
            onMouseEnter={(e) => { if (!e.currentTarget.style.background.includes("0.15")) e.currentTarget.style.background = "rgba(59,130,246,0.06)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            onMouseLeave={(e) => { if (!e.currentTarget.style.background.includes("0.15")) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
          >
            <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
            {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t(item.labelKey) || item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "10px", borderTop: "1px solid #1A2E45", flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 6, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || "D"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Dr. {user?.name}</div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: GOLD }}>{user?.uniqueId}</div>
            </div>
          </div>
        )}
        <button onClick={logout}
        className="dashboard-control"
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, width: "100%", fontSize: 13, color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!collapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
}

export default function DoctorLayout() {
  const { user, logout } = useContext(AuthContext);
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const closeDrawer = () => setMobileOpen(false);

  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-primary)" }}>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={closeDrawer}
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
        />
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside style={{
          width: collapsed ? 72 : 240,
                    background: "var(--bg-secondary)",
                    borderRight: "1px solid var(--border)",
          flexShrink: 0,
          transition: "width 0.3s ease",
          overflow: "hidden",
        }}>
          <SidebarContent user={user} logout={logout} collapsed={collapsed} onNavClick={null} />
        </aside>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <aside style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: 240, zIndex: 50,
                    background: "var(--bg-secondary)",
                    borderRight: "1px solid var(--border)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s ease",
        }}>
          <SidebarContent user={user} logout={logout} collapsed={false} onNavClick={closeDrawer} />
        </aside>
      )}

      {/* Main */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

        {/* Topbar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", height: 56, flexShrink: 0,
          background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)",
        }}>
          <button
            onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed)}
            className="dashboard-control"
            style={{
              width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#1A2E45"; e.currentTarget.style.color = GOLD; e.currentTarget.style.borderColor = GOLD + "60"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#1A2E45"; }}
          >
            {isMobile ? (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {collapsed ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
              </svg>
            )}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>
                {isMobile ? t('doctorPortal') : t('doctorPortal')}
              </span>
            </div>

            <select className="dashboard-control" value={lang} onChange={(e) => setLang(e.target.value)} style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)", padding: "6px 8px", borderRadius: 8 }}>
              <option value="en">{t('languageEnglish')}</option>
              <option value="mr">{t('languageMarathi')}</option>
            </select>

            <button className="dashboard-control" onClick={toggleTheme} title="Toggle theme" style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            <span style={{ fontSize: 11, color: "#4A5568" }}>
              {new Date().toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { day: "numeric", month: "short" })}
            </span>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px", background: "var(--bg-primary)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}