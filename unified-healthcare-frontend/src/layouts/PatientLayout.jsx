import { useContext, useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import Logo from "../components/common/Logo";

// ─── Nav items ─────────────────────────────────────────────────
const navItems = [
  { to: "/patient/dashboard", label: "Dashboard", labelKey: "dashboard", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, },
  { to: "/patient/timeline", label: "Medical Timeline", labelKey: "medicalTimeline", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, },
  { to: "/patient/find-doctors", label: "Find Doctors", labelKey: "findDoctors", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, },
  { to: "/patient/upload-report", label: "Upload Report", labelKey: "uploadReport", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, },
  { to: "/patient/payments", label: "Payments", labelKey: "payments", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, },
  { to: "/patient/profile", label: "Profile", labelKey: "profile", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, },
];

const ACCENT = "#a855f7";
const GOLD   = "#C9A84C";

// ─── Sidebar content (shared for desktop + mobile drawer) ──────
function SidebarContent({ user, logout, collapsed, onNavClick }) {
  const { t } = useLanguage();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Gold top bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#A07830,#C9A84C,#F0D98C,#C9A84C,#A07830)", flexShrink: 0 }} />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px", borderBottom: "1px solid #1A2E45", flexShrink: 0 }}>
        <Logo subtitle={t('patientPortal')} collapsed={collapsed} inDashboard />
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
              background: isActive ? "rgba(168,85,247,0.15)" : "transparent",
              color: isActive ? ACCENT : "var(--text-secondary)",
              border: isActive ? "1px solid rgba(168,85,247,0.25)" : "1px solid transparent",
              transition: "all 0.15s",
            })}
            onMouseEnter={(e) => { if (!e.currentTarget.style.background.includes("0.15")) e.currentTarget.style.background = "rgba(168,85,247,0.06)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            onMouseLeave={(e) => { if (!e.currentTarget.style.background.includes("0.15")) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
          >
            <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
            {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t(item.labelKey) || item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user card + logout */}
      <div style={{ padding: "10px", borderTop: "1px solid #1A2E45", flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 6, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || "P"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
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

export default function PatientLayout() {
  const { user, logout } = useContext(AuthContext);
  const [collapsed,    setCollapsed]    = useState(false);  // desktop sidebar
  const [mobileOpen,   setMobileOpen]   = useState(false);  // mobile drawer
  const [isMobile,     setIsMobile]     = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close drawer on route change (mobile)
  const closeDrawer = () => setMobileOpen(false);

  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: "flex", gap: isMobile ? 0 : 14, padding: isMobile ? 0 : 12, height: "100vh", overflow: "hidden", background: "var(--bg-primary)" }}>

      {/* ── MOBILE OVERLAY ── */}
      {isMobile && mobileOpen && (
        <div
          onClick={closeDrawer}
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
        />
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <aside style={{
          width: collapsed ? 72 : 240,
          background: "var(--bg-secondary)",
          border: "1px solid rgba(201,168,76,0.7)", borderTop: "3px solid #C9A84C", borderRadius: 16,
          height: "100%",
          flexShrink: 0,
          transition: "width 0.3s ease",
          overflow: "hidden",
        }}>
          <SidebarContent user={user} logout={logout} collapsed={collapsed} onNavClick={null} />
        </aside>
      )}

      {/* ── MOBILE DRAWER ── */}
      {isMobile && (
        <aside style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: 240, zIndex: 50,
          background: "var(--bg-secondary)",
          border: "1px solid rgba(201,168,76,0.7)", borderTop: "3px solid #C9A84C", borderRadius: 16,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s ease",
        }}>
          <SidebarContent user={user} logout={logout} collapsed={false} onNavClick={closeDrawer} />
        </aside>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%", overflow: "hidden", border: "1px solid var(--shell-border)", borderRadius: 16, boxShadow: "0 8px 24px rgba(15,23,42,0.08)", background: "var(--bg-primary)" }}>

        {/* Topbar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", height: 56, flexShrink: 0,
          background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)",
        }}>
          {/* Toggle button — arrow on desktop, hamburger on mobile */}
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
              /* Hamburger on mobile */
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            ) : (
              /* Arrow on desktop */
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {collapsed ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
              </svg>
            )}
          </button>

          {/* Right — portal badge + date */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>
                {isMobile ? t('patientPortal') : t('patientPortal')}
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

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px", background: "var(--bg-primary)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}