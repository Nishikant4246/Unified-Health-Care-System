import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";

const cardVariants = {
  hidden:   { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function PatientDashboard() {
  const { user }    = useContext(AuthContext);
  const navigate    = useNavigate();

  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/patient/stats"),
      api.get("/patient/my-records?limit=3"),
    ])
      .then(([s, r]) => {
        setStats(s.data);
        setRecent(r.data?.records || r.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user) return (
    <div className="text-center mt-20" style={{ color: "#f1f5f9" }}>Loading...</div>
  );

  const actions = [
    { label: "Medical Timeline", desc: "Your complete health history",   path: "/patient/timeline",      color: "#a855f7", icon: "🏥" },
    { label: "Upload Report",    desc: "Import past medical documents",   path: "/patient/upload-report", color: "#10b981", icon: "📎" },
    { label: "Payment History",  desc: "View all medical bills",          path: "/patient/payments",      color: "#f59e0b", icon: "💳" },
    { label: "My Profile",       desc: "Update your personal details",    path: "/patient/profile",       color: "#3b82f6", icon: "👤" },
  ];

  return (
    <PageTransition>

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 rounded-2xl relative overflow-hidden"
        style={{ background: "#1e2130", border: "1px solid rgba(168,85,247,0.25)" }}
      >
        {/* Subtle bg glow */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)", color: "white" }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </motion.div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: "#94a3b8" }}>Welcome back</p>
              <h1 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
                >
                  {user.uniqueId}
                </span>
                {user.phone && (
                  <span className="text-xs" style={{ color: "#64748b" }}>📞 {user.phone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Health badge */}
          <div className="text-right hidden md:block">
            <div className="text-xs mb-1" style={{ color: "#64748b" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              ● Active Patient
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Visits",    value: loading ? "—" : (stats?.totalRecords  ?? "—"), color: "#a855f7" },
          { label: "Doctors Seen",    value: loading ? "—" : (stats?.totalDoctors  ?? "—"), color: "#3b82f6" },
          { label: "Total Spent",     value: loading ? "—" : (stats?.totalSpent != null ? "₹" + Number(stats.totalSpent).toLocaleString("en-IN") : "—"), color: "#f59e0b" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="p-4 rounded-2xl text-center"
            style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: "#64748b" }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Recent Records ── */}
      {!loading && recent.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl mb-6"
          style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Recent Visits</span>
            <button
              onClick={() => navigate("/patient/timeline")}
              className="text-xs px-3 py-1 rounded-lg"
              style={{ background: "#a855f718", color: "#a855f7", border: "1px solid #a855f730" }}
            >
              Full Timeline →
            </button>
          </div>
          <div className="space-y-2">
            {recent.map((rec, i) => (
              <motion.div
                key={rec._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "#252837" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "#a855f718", color: "#a855f7" }}
                  >
                    {rec.doctor?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
                      {rec.diagnosis}
                    </div>
                    <div className="text-xs" style={{ color: "#64748b" }}>
                      {rec.doctor ? "Dr. " + rec.doctor.name : "Self Upload"} ·{" "}
                      {new Date(rec.visitDate || rec.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>
                {rec.paymentAmount > 0 && (
                  <span className="text-xs font-semibold" style={{ color: "#f59e0b" }}>
                    ₹{rec.paymentAmount}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Quick Action Cards ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>
          YOUR HEALTH PORTAL
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, i) => (
            <motion.button
              key={action.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, borderColor: action.color + "60" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="p-5 rounded-2xl text-left transition-all"
              style={{
                background: "#1e2130",
                border: "1px solid #2a2d3e",
                cursor: "pointer",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: action.color + "18" }}
                >
                  {action.icon}
                </div>
                <div className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>
                  {action.label}
                </div>
              </div>
              <div className="text-xs ml-12" style={{ color: "#64748b" }}>
                {action.desc}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </PageTransition>
  );
}