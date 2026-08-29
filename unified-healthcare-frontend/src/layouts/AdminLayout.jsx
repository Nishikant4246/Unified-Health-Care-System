import { useContext, useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import Logo from "../components/common/Logo";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", labelKey: "dashboard", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to: "/admin/doctors", label: "Doctors", labelKey: "doctors", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
  { to: "/admin/pending-doctors", label: "Approvals", labelKey: "approvals", badge: true, icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { to: "/admin/patients", label: "Patients", labelKey: "patients", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
];

const ACCENT = "#10b981";
const GOLD   = "#C9A84C";

function SidebarContent({ user, logout, collapsed, onNavClick }) {
  const { t } = useLanguage();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,#A07830,#C9A84C,#F0D98C,#C9A84C,#A07830)", flexShrink: 0 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px", borderBottom: "1px solid #1A2E45", flexShrink: 0 }}>
        <Logo subtitle={t('adminPanel')} collapsed={collapsed} />
      </div>

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
              background: isActive ? "rgba(16,185,129,0.15)" : "transparent",
              color: isActive ? ACCENT : "var(--text-secondary)",
              border: isActive ? "1px solid rgba(16,185,129,0.25)" : "1px solid transparent",
              transition: "all 0.15s",
            })}
            onMouseEnter={(e) => { if (!e.currentTarget.style.background.includes("0.15")) e.currentTarget.style.background = "rgba(16,185,129,0.06)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            onMouseLeave={(e) => { if (!e.currentTarget.style.background.includes("0.15")) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
          >
            <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
            {!collapsed && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t(item.labelKey) || item.label}</span>}
            {!collapsed && item.badge && (
              <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20, background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontWeight: 600 }}>●</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "10px", borderTop: "1px solid #1A2E45", flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 6, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: GOLD }}>Administrator</div>
            </div>
          </div>
        )}
        <button onClick={logout}
          className="dashboard-control"
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, width: "100%", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", transition: "all 0.15s" }}
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

export default function AdminLayout() {
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

  const navItems = [
    { to: "/admin/dashboard", label: t("dashboard"), icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { to: "/admin/doctors", label: t("doctors"), icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
    { to: "/admin/pending-doctors", label: t("approvals"), badge: true, icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { to: "/admin/patients", label: t("patients"), icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  ];

  return (
    <div style={{ display: "flex", gap: isMobile ? 0 : 14, padding: isMobile ? 0 : 12, height: "100vh", overflow: "hidden", background: "var(--bg-primary)" }}>

      {isMobile && mobileOpen && (
        <div onClick={closeDrawer}
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
        />
      )}

      {!isMobile && (
        <aside style={{
          width: collapsed ? 72 : 240, background: "var(--bg-secondary)",
          border: "1px solid rgba(201,168,76,0.7)", borderTop: "3px solid #C9A84C", borderRadius: 16,
          height: "100%", flexShrink: 0,
          transition: "width 0.3s ease", overflow: "hidden",
        }}>
          <SidebarContent user={user} logout={logout} collapsed={collapsed} onNavClick={null} />
        </aside>
      )}

      {isMobile && (
        <aside style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: 240, zIndex: 50, background: "var(--bg-secondary)",
          border: "1px solid rgba(201,168,76,0.7)", borderTop: "3px solid #C9A84C", borderRadius: 16,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s ease",
        }}>
          <SidebarContent user={user} logout={logout} collapsed={false} onNavClick={closeDrawer} />
        </aside>
      )}

      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%", overflow: "hidden", border: "1px solid var(--shell-border)", borderRadius: 16, boxShadow: "0 8px 24px rgba(15,23,42,0.08)", background: "var(--bg-primary)" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>
                {isMobile ? t("adminPanel") : t("systemOnline")}
              </span>
            </div>

            {/* Language selector */}
            <select className="dashboard-control" value={lang} onChange={(e) => setLang(e.target.value)} style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)", padding: "6px 8px", borderRadius: 8 }}>
              <option value="en">{t('languageEnglish')}</option>
              <option value="mr">{t('languageMarathi')}</option>
            </select>

            {/* Theme toggle */}
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