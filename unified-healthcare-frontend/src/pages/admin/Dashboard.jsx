import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const StatCard = ({ title, value, icon, color, delay }) => (
  <div
    className="p-6 rounded-2xl animate-slide-up"
    style={{
      background: "#1e2130",
      border: "1px solid #2a2d3e",
      animationDelay: delay,
    }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl" style={{ background: color + "22" }}>
        <span style={{ color }}>{icon}</span>
      </div>

      <span
        className="text-xs px-2 py-1 rounded-full font-medium"
        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
      >
        Live
      </span>
    </div>

    <div className="text-3xl font-bold mb-1" style={{ color: "#f1f5f9" }}>
      {value ?? (
        <span className="text-lg" style={{ color: "#94a3b8" }}>
          Loading...
        </span>
      )}
    </div>

    <div className="text-sm" style={{ color: "#94a3b8" }}>
      {title}
    </div>
  </div>
);

const quickActions = [
  { label: "View All Doctors", path: "/admin/doctors", color: "#10b981" },
  { label: "Pending Approvals", path: "/admin/pending-doctors", color: "#fbbf24" },
  { label: "View All Patients", path: "/admin/patients", color: "#3b82f6" },
  { label: "Create Doctor", path: "/admin/doctors", color: "#a855f7" },
];

export default function AdminDashboard() {

  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {

    if (user?.role !== "admin") return;

    const fetchStats = async () => {

      try {

        const res = await api.get("/admin/stats");
        setStats(res.data);

      } catch (err) {

        if (err.response?.status === 403) {
          console.warn("Admin access required");
          return;
        }

        console.error(err);

      }

    };

    fetchStats();

  }, []);

  if (user?.role !== "admin") {
    return (
      <div className="text-center mt-20 text-lg" style={{ color: "#f1f5f9" }}>
        Access Denied
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>
          Dashboard Overview
        </h1>

        <p className="text-sm" style={{ color: "#94a3b8" }}>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <StatCard
          title="Total Doctors"
          value={stats?.totalDoctors}
          color="#10b981"
          delay="0ms"
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
          value={stats?.totalPatients}
          color="#3b82f6"
          delay="80ms"
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
          value={stats?.totalRecords}
          color="#a855f7"
          delay="160ms"
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

        <h2 className="text-lg font-semibold mb-4" style={{ color: "#f1f5f9" }}>
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {quickActions.map((action) => (

            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="p-4 rounded-xl text-sm font-medium text-center transition-all"
              style={{
                background: action.color + "18",
                border: "1px solid " + action.color + "30",
                color: action.color,
                cursor: "pointer",
              }}
            >
              {action.label}
            </button>

          ))}

        </div>

      </div>

      {/* System Status */}
      <div
        className="p-5 rounded-2xl"
        style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
      >

        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#10b981" }}
          />
          <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>
            System Status
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">

          {[
            { label: "Backend API", status: "Operational" },
            { label: "Database", status: "Connected" },
            { label: "File Storage", status: "Active" },
          ].map((item) => (

            <div key={item.label} className="flex items-center gap-2">

              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#10b981" }}
              />

              <span className="text-xs" style={{ color: "#94a3b8" }}>
                {item.label}
              </span>

              <span
                className="text-xs ml-auto"
                style={{ color: "#10b981" }}
              >
                {item.status}
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}