import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { StatCardSkeleton } from "../../components/common/Skeleton";
import { useLanguage } from "../../context/LanguageContext";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

function StatCard({ title, value, icon, color, index, subtitle, liveText }) {
  return (
    <motion.div
      custom={index} variants={cardVariants} initial="hidden" animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-6 rounded-2xl cursor-default"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl" style={{ background: color + "20" }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
          {liveText}
        </span>
      </div>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.3 + index * 0.1 }}
        className="text-3xl font-bold mb-1" style={{ color: "#f1f5f9" }}
      >
        {value ?? "—"}
      </motion.div>
      <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</div>
      {subtitle && <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{subtitle}</div>}
    </motion.div>
  );
}

const quickActions = [
  { labelKey: "searchPatient", path: "/doctor/search-patient", color: "#10b981" },
  { labelKey: "addRecord",     path: "/doctor/add-record",     color: "#3b82f6" },
  { labelKey: "myPatients",    path: "/doctor/patients",       color: "#a855f7" },
  { labelKey: "myRecords",     path: "/doctor/my-records",     color: "#fbbf24" },
];

export default function DoctorDashboard() {
  const [stats,         setStats]         = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [locLoading,    setLocLoading]    = useState(false);
  const [locMsg,        setLocMsg]        = useState("");
  const navigate                          = useNavigate();
  const { user, refreshUser }             = useContext(AuthContext);

  useEffect(() => {
    if (!user || user.role !== "doctor") return;
    Promise.all([
      api.get("/doctor/stats"),
      api.get("/doctor/my-records?limit=5"),
    ])
      .then(([statsRes, recordsRes]) => {
        setStats(statsRes.data);
        setRecentRecords(recordsRes.data?.records || recordsRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // ── Set location from hospital address ────────────────────
  const handleSetLocation = async () => {
    if (!user?.hospital) {
      setLocMsg("Please fill your hospital address in your profile first.");
      return;
    }
    setLocLoading(true);
    setLocMsg("");
    try {
      const res = await api.post("/doctor/update-location", { address: user.hospital });
      setLocMsg("✅ Location set successfully! Patients can now find you on the map.");
      await refreshUser();
    } catch (err) {
      setLocMsg(err.response?.data?.message || "Failed to set location. Try a more specific address.");
    } finally {
      setLocLoading(false);
    }
  };

  const { t } = useLanguage();

  return (
    <PageTransition>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{t('dashboard')}</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {t('welcomeBack').replace('{name}', user?.name || '')} &nbsp;·&nbsp;{" "}
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
        ) : (
          <>
            <StatCard title="My Patients"      value={stats?.totalPatients}    subtitle="Treated by you"   color="#10b981" index={0}
              liveText={t('live')}
              icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
            />
            <StatCard title="Records Created"  value={stats?.totalRecords}     subtitle="All time"         color="#3b82f6" index={1}
              liveText={t('live')}
              icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            />
            <StatCard title="This Month"       value={stats?.thisMonthRecords} subtitle="Records added"    color="#a855f7" index={2}
              liveText={t('live')}
              icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            />
          </>
        )}
      </div>

      {/* ── Set My Location Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-5 rounded-2xl mb-8"
        style={{ background: "var(--bg-card)", border: "1px solid rgba(16,185,129,0.3)" }}
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            📍
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Set Your Location on Patient Map
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
              Patients searching for nearby doctors will see you on the map.
              Your hospital address will be automatically converted to map coordinates.
              {user?.hospital && (
                <span style={{ color: "#10b981" }}> Current: {user.hospital}</span>
              )}
            </p>
            {locMsg && (
              <p className="text-xs mb-3"
                style={{ color: locMsg.startsWith("✅") ? "#10b981" : "#f87171" }}>
                {locMsg}
              </p>
            )}
            <button
              onClick={handleSetLocation}
              disabled={locLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: locLoading ? "#0d9268" : "#10b981",
                color:      "white",
                cursor:     locLoading ? "not-allowed" : "pointer",
                opacity:    locLoading ? 0.8 : 1,
              }}
            >
              {locLoading ? t('settingLocation') : t('setMyLocation')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "#f1f5f9" }}>{t('quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              onClick={() => navigate(action.path)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              className="dashboard-action-card p-4 rounded-xl text-sm font-semibold text-center transition-colors"
              style={{ background: "var(--bg-card)", border: "1px solid " + action.color + "55", borderLeft: "3px solid " + action.color, color: "var(--text-primary)", cursor: "pointer" }}
            >
              {t(action.labelKey)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Records */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-5 rounded-2xl mb-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t('recentRecords')}</span>
          <button onClick={() => navigate("/doctor/my-records")}
            className="text-xs px-3 py-1 rounded-lg transition-all"
            style={{ background: "#10b98118", color: "#10b981", border: "1px solid #10b98130" }}>
                  {t('viewAll')}
          </button>
        </div>
        {loading ? (
          <div className="text-center py-6" style={{ color: "var(--text-secondary)" }}>{t('loading')}</div>
        ) : recentRecords.length === 0 ? (
          <div className="text-center py-6 text-sm" style={{ color: "#64748b" }}>
            No records yet. Search a patient to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {recentRecords.map((record, i) => (
              <motion.div
                key={record._id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.06 }}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: "var(--bg-hover)" }}
                onClick={() => navigate("/doctor/patients/" + record.patient?._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "#3b82f618", color: "#3b82f6" }}>
                    {record.patient?.name?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {record.patient?.name || "Unknown"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {record.patient?.uniqueId} · {record.diagnosis?.slice(0, 28)}{record.diagnosis?.length > 28 ? "..." : ""}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-right flex-shrink-0" style={{ color: "#64748b" }}>
                  {new Date(record.visitDate || record.createdAt).toLocaleDateString("en-IN")}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-5 rounded-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full" style={{ background: "#10b981" }}
          />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>System Status</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Backend API",  status: "Operational" },
            { label: "Database",     status: "Connected"   },
            { label: "File Storage", status: "Active"      },
          ].map((item, i) => (
            <motion.div key={item.label}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.65 + i * 0.08 }}
              className="flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <span className="text-xs ml-auto" style={{ color: "#10b981" }}>{item.status}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </PageTransition>
  );
}