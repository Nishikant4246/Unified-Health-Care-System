import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { useLanguage } from "../../context/LanguageContext";
import { calcAge, calcBMI, bmiCategory } from "../../utils/health";

// ─── Golden Design Tokens ──────────────────────────────────────
const GOLD       = "#C9A84C";
const GOLD_LIGHT = "#F0D98C";
const GOLD_DARK  = "#A07830";
const NAVY       = "var(--bg-secondary)";
const NAVY_MID   = "var(--bg-card)";

const cardVariants = {
  hidden:   { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function PatientDashboard() {
  const { user }  = useContext(AuthContext);
  const { t }     = useLanguage();
  const navigate  = useNavigate();
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
    <div className="text-center mt-20" style={{ color: "var(--text-primary)" }}>{t('loading')}</div>
  );

  const age    = calcAge(user?.dateOfBirth);
  const bmi    = calcBMI(user?.heightCm, user?.weightKg);
  const bmiCat = bmiCategory(bmi);
  const hasHealthInfo = user?.dateOfBirth || user?.heightCm || user?.weightKg;

  const actions = [
    { label: t('medicalTimeline'), desc: "Your complete health history",      path: "/patient/timeline",      color: "#a855f7", icon: "" },
    { label: t('uploadReport'),    desc: "Import past medical documents",      path: "/patient/upload-report", color: "#10b981", icon: "" },
    { label: t('payments'),        desc: "View all medical bills",             path: "/patient/payments",      color: "#f59e0b", icon: "" },
    { label: t('profile'),         desc: "Update your personal details",       path: "/patient/profile",       color: "#64748b", icon: "" },
  ];

  return (
    <PageTransition>

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 rounded-2xl relative overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid rgba(168,85,247,0.25)" }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)", color: "white" }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </motion.div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: "#94a3b8" }}>{t('welcomeBack').replace('{name}', '')}</p>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
                  {user.uniqueId}
                </span>
                {user.phone && (
                  <span className="text-xs" style={{ color: "#64748b" }}>📞 {user.phone}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs mb-1" style={{ color: "#64748b" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              ● Active Patient
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Visits",  value: loading ? "—" : (stats?.totalRecords ?? "—"),  color: "#a855f7" },
          { label: "Doctors Seen",  value: loading ? "—" : (stats?.totalDoctors ?? "—"),  color: "#3b82f6" },
          { label: "Total Spent",   value: loading ? "—" : (stats?.totalSpent != null ? "₹" + Number(stats.totalSpent).toLocaleString("en-IN") : "—"), color: "#f59e0b" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i} variants={cardVariants} initial="hidden" animate="visible"
            className="p-4 rounded-2xl text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs" style={{ color: "#64748b" }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Health Snapshot (DOB · Age · BMI) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 p-5 rounded-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Health Snapshot</span>
          <button onClick={() => navigate("/patient/profile")}
            className="text-xs px-3 py-1 rounded-lg"
            style={{ background: "#a855f718", color: "#a855f7", border: "1px solid #a855f730" }}>
            {hasHealthInfo ? "Update" : "Add details"}
          </button>
        </div>
        {hasHealthInfo ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Age",    value: age != null ? `${age} yrs` : "—" },
              { label: "Height", value: user?.heightCm ? `${user.heightCm} cm` : "—" },
              { label: "Weight", value: user?.weightKg ? `${user.weightKg} kg` : "—" },
              { label: "BMI",    value: bmi != null ? bmi : "—", cat: bmiCat },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: "var(--bg-hover)" }}>
                <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{item.value}</div>
                <div className="text-xs" style={{ color: "#64748b" }}>{item.label}</div>
                {item.cat && (
                  <div className="text-xs mt-0.5 font-medium" style={{ color: item.cat.color }}>{item.cat.label}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "#64748b" }}>
            Add your date of birth, height and weight in your profile to track age and BMI.
          </p>
        )}
      </motion.div>

      {/* ── Find Nearby Doctors Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={() => navigate("/patient/find-doctors")}
        className="mb-6 cursor-pointer relative overflow-hidden rounded-2xl"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        style={{ background: NAVY }}
      >
        {/* Gold top bar */}
        <div style={{
          height: "4px",
          background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_DARK})`,
        }} />

        {/* Navy header section */}
        <div className="relative overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_MID} 100%)`, padding: "24px 28px 20px" }}>

          {/* Background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${GOLD}15 0%, transparent 70%)`, transform: "translate(20%, -20%)" }} />

          <div className="relative z-10 flex items-center gap-4">
            {/* Gold icon circle */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: `rgba(201,168,76,0.15)`,
                border: `1px solid rgba(201,168,76,0.4)`,
              }}>
              🗺️
            </div>

            <div className="flex-1">
              {/* Brand label */}
              <p style={{
                margin: "0 0 4px",
                fontSize: "10px",
                letterSpacing: "3px",
                color: GOLD,
                fontWeight: 600,
                textTransform: "uppercase",
              }}>
                Unified Health Care System
              </p>
              {/* Title */}
              <div className="flex items-center gap-2">
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>
                    {t('findNearbyDoctors')}
                </h3>
                <span style={{
                  fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600,
                  background: `rgba(201,168,76,0.2)`, color: GOLD_LIGHT,
                  border: `1px solid rgba(201,168,76,0.4)`,
                }}>
                  NEW
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                UHCS registered doctors &amp; real hospitals near you
              </p>
            </div>

            {/* Arrow */}
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
              stroke={GOLD} strokeWidth={2} className="flex-shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Gold divider */}
        <div style={{
          height: "2px",
          background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_DARK})`,
        }} />

        {/* White body section */}
        <div style={{ background: "#FAFAF7", padding: "16px 28px 20px" }}>
          <div className="flex items-center gap-2 flex-wrap">
            {[
            { step: "", label: t('clickToGetDirection') },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`,
                  color: NAVY, fontSize: "10px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {s.step}
                </div>
                <span style={{ fontSize: "12px", color: "#4A5568", fontWeight: 500 }}>{s.label}</span>
                {i < 3 && (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                    stroke={GOLD} strokeWidth={2} style={{ margin: "0 4px" }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#a855f7" }} />
            <span style={{ fontSize: "11px", color: "#718096" }}>{t('uhcsDoctors')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6" }} />
            <span style={{ fontSize: "11px", color: "#718096" }}>{t('realHospitals')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: "11px", color: "#718096" }}>{t('yourLocation')}</span>
            </div>
          </div>
        </div>

        {/* Gold bottom bar */}
        <div style={{
          height: "4px",
          background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_DARK})`,
        }} />
      </motion.div>

      {/* ── Recent Records ── */}
      {!loading && recent.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl mb-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t('recentVisits')}</span>
            <button onClick={() => navigate("/patient/timeline")}
              className="text-xs px-3 py-1 rounded-lg"
              style={{ background: "#a855f718", color: "#a855f7", border: "1px solid #a855f730" }}>
                          {t('fullTimeline')}
            </button>
          </div>
          <div className="space-y-2">
            {recent.map((rec, i) => (
              <motion.div key={rec._id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "var(--bg-hover)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "#a855f718", color: "#a855f7" }}>
                    {rec.doctor?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{rec.diagnosis}</div>
                    <div className="text-xs" style={{ color: "#64748b" }}>
                      {rec.doctor ? "Dr. " + rec.doctor.name : "Self Upload"} ·{" "}
                      {new Date(rec.visitDate || rec.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>
                {rec.paymentAmount > 0 && (
                  <span className="text-xs font-semibold" style={{ color: "#f59e0b" }}>₹{rec.paymentAmount}</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Quick Action Cards ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>YOUR HEALTH PORTAL</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, i) => (
            <motion.button
              key={action.label}
              custom={i} variants={cardVariants} initial="hidden" animate="visible"
              whileHover={{ scale: 1.02, borderColor: action.color + "60" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="dashboard-action-card p-5 rounded-2xl text-left transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid " + action.color + "55", borderLeft: "3px solid " + action.color, cursor: "pointer" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: action.color + "18" }}>
                  {action.icon}
                </div>
                <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{action.label}</div>
              </div>
              <div className="text-xs ml-12" style={{ color: "#64748b" }}>{action.desc}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </PageTransition>
  );
}