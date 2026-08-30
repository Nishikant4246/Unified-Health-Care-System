import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const StatCard = ({ title, value, icon, color, delay, subtitle, liveText }) => (
  <div
    className="p-6 rounded-2xl animate-slide-up"
    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", animationDelay: delay }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl" style={{ background: color + "22" }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <span
        className="text-xs px-2 py-1 rounded-full font-medium"
        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
      >
        {liveText}
      </span>
    </div>
    <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
      {value ?? <span className="text-lg" style={{ color: "var(--text-secondary)" }}>—</span>}
    </div>
    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</div>
    {subtitle && (
      <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{subtitle}</div>
    )}
  </div>
);

const quickActions = [
  { labelKey: "doctors",         path: "/admin/doctors",         color: "#10b981" },
  { labelKey: "approvals",       path: "/admin/pending-doctors", color: "#fbbf24" },
  { labelKey: "patients",        path: "/admin/patients",        color: "#3b82f6" },
  { labelKey: "createDoctor",    path: "/admin/doctors",         color: "#a855f7" },
];

export default function AdminDashboard() {
  const [stats, setStats]               = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const navigate      = useNavigate();
  const { user }      = useContext(AuthContext); 

  useEffect(() => {
   
    if (!user) return;

    // Guard — only admin can fetch
    if (user.role !== "admin") return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, pendingRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/pending-doctors"),
        ]);

        setStats(statsRes.data);
        setPendingCount(pendingRes.data.length);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]); 

  // Not admin
  const { t } = useLanguage();

  if (user && user.role !== "admin") {
    return (
      <div className="text-center mt-20 text-lg" style={{ color: "var(--text-primary)" }}>
        {t('accessDenied')}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center mt-20">
        <p className="text-sm mb-4" style={{ color: "#f87171" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ background: "var(--emerald)", color: "#fff" }}
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      {/* Header*/}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          {t('dashboardOverview')}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {/*Pending Doctors Alert */}
      {pendingCount > 0 && (
        <div
          className="mb-6 p-4 rounded-xl flex items-center justify-between cursor-pointer"
          style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.25)",
          }}
          onClick={() => navigate("/admin/pending-doctors")}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#fbbf24" }}
            />
            <span className="text-sm font-medium" style={{ color: "#fbbf24" }}>
              {t('pendingDoctorsMsg').replace('{count}', String(pendingCount)).replace('{plural}', pendingCount>1? 's':'')}
            </span>
          </div>
          <span className="text-xs" style={{ color: "#fbbf24" }}>{t('viewAll')}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Doctors"
          value={loading ? null : stats?.totalDoctors}
          color="#10b981"
          delay="0ms"
          subtitle="Approved & active"
          liveText={t('live')}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          }
        />
        <StatCard
          title="Total Patients"
          value={loading ? null : stats?.totalPatients}
          color="#3b82f6"
          delay="80ms"
          subtitle="Registered users"
          liveText={t('live')}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          }
        />
        <StatCard
          title="Medical Records"
          value={loading ? null : stats?.totalRecords}
          color="#a855f7"
          delay="160ms"
          subtitle="Total across all patients"
          liveText={t('live')}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          {t('quickActions')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.labelKey}
              onClick={() => navigate(action.path)}
              className="dashboard-action-card p-4 rounded-xl text-sm font-semibold text-center transition-all relative"
              style={{
                background: "var(--bg-card)",
                border: "1px solid " + action.color + "55",
                borderLeft: "3px solid " + action.color,
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
            >
              {action.labelKey === "approvals" && pendingCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: "#fbbf24", color: "#0f1117" }}
                >
                  {pendingCount}
                </span>
              )}
              {t(action.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div
        className="p-5 rounded-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#10b981" }}
          />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            System Status
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
          { label: "Authentication",       status: "Operational" },
          { label: "Email Service",        status: "Operational" },
          { label: "Doctor Verification",  status: "Active" },
            { label: "Backend API",   status: "Operational" },
            { label: "Database",      status: "Connected"   },
            { label: "File Storage",  status: "Active"      },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <span className="text-xs ml-auto" style={{ color: "#10b981" }}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}