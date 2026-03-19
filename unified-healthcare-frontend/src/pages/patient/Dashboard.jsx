import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";

// ─── Golden Design Tokens ──────────────────────────────────────
const GOLD       = "#C9A84C";
const GOLD_LIGHT = "#F0D98C";
const GOLD_DARK  = "#A07830";
const NAVY       = "#0D1B2A";
const NAVY_MID   = "#1A2E45";

const cardVariants = {
  hidden:   { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

// ─── Haversine distance ────────────────────────────────────────
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
};

export default function PatientDashboard() {
  const { user }  = useContext(AuthContext);
  const navigate  = useNavigate();

  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Emergency state ───────────────────────────────────────
  const [emergExpanded,  setEmergExpanded]  = useState(false);
  const [emergStatus,    setEmergStatus]    = useState("idle"); // idle | locating | ready | error
  const [nearestDoctor,  setNearestDoctor]  = useState(null);
  const [userLoc,        setUserLoc]        = useState(null);

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

  // ─── Emergency: get GPS + nearest UHCS doctor ─────────────
  const handleEmergencyOpen = useCallback(() => {
    setEmergExpanded(true);
    if (emergStatus === "ready") return; // already loaded
    setEmergStatus("locating");

    if (!navigator.geolocation) {
      setEmergStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        try {
          const res     = await api.get(`/patient/nearby-doctors?lat=${loc.lat}&lng=${loc.lng}&radius=50`);
          const doctors = res.data || [];
          // Find nearest available doctor
          const available = doctors.filter((d) => d.available !== false);
          setNearestDoctor(available[0] || doctors[0] || null);
          setEmergStatus("ready");
        } catch {
          setEmergStatus("ready"); // still show 108 + maps even if API fails
        }
      },
      () => setEmergStatus("error"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [emergStatus]);

  // ─── Google Maps nearest hospital URL ─────────────────────
  const nearestHospitalUrl = userLoc
    ? `https://www.google.com/maps/search/hospital+near+me/@${userLoc.lat},${userLoc.lng},14z`
    : `https://www.google.com/maps/search/hospital+near+me`;

  const doctorDirectionsUrl = nearestDoctor?.location?.lat
    ? `https://www.google.com/maps/dir/?api=1&destination=${nearestDoctor.location.lat},${nearestDoctor.location.lng}`
    : null;

  if (!user) return (
    <div className="text-center mt-20" style={{ color: "#f1f5f9" }}>Loading...</div>
  );

  const actions = [
    { label: "Medical Timeline", desc: "Your complete health history",      path: "/patient/timeline",      color: "#a855f7", icon: "🏥" },
    { label: "Upload Report",    desc: "Import past medical documents",      path: "/patient/upload-report", color: "#10b981", icon: "📎" },
    { label: "Payment History",  desc: "View all medical bills",             path: "/patient/payments",      color: "#f59e0b", icon: "💳" },
    { label: "My Profile",       desc: "Update your personal details",       path: "/patient/profile",       color: "#64748b", icon: "👤" },
  ];

  return (
    <PageTransition>

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 rounded-2xl relative overflow-hidden"
        style={{ background: "#1e2130", border: "1px solid rgba(168,85,247,0.25)" }}
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
              <p className="text-xs mb-0.5" style={{ color: "#94a3b8" }}>Welcome back</p>
              <h1 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>{user.name}</h1>
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
          <motion.div key={stat.label}
            custom={i} variants={cardVariants} initial="hidden" animate="visible"
            className="p-4 rounded-2xl text-center"
            style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs" style={{ color: "#64748b" }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          🚨 EMERGENCY CARD
          ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(239,68,68,0.4)" }}
      >
        {/* Red pulsing header */}
        <motion.div
          onClick={handleEmergencyOpen}
          className="p-5 cursor-pointer relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)" }}
          whileHover={{ filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Animated pulse bg */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: "radial-gradient(circle at 20% 50%, rgba(239,68,68,0.4) 0%, transparent 60%)" }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Pulsing dot */}
              <div className="relative flex-shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: "#ef4444" }}
                />
                <div className="w-10 h-10 rounded-full flex items-center justify-center relative z-10"
                  style={{ background: "rgba(239,68,68,0.3)", border: "2px solid #ef4444" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className="font-bold text-base" style={{ color: "#fff" }}>🚨 Emergency Help</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Tap for instant help — 108, nearest hospital, available doctor
                </div>
              </div>
            </div>
            <motion.div
              animate={{ rotate: emergExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.8)" strokeWidth={2}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Expanded emergency options */}
        <AnimatePresence>
          {emergExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
              style={{ background: "#1a0a0a" }}
            >
              <div className="p-5 space-y-3">

                {/* ── Option 1: Call 108 ── */}
                <a href="tel:108"
                  className="flex items-center gap-4 p-4 rounded-xl transition-all"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}>
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ color: "#f87171" }}>📞 Call 108 — Ambulance</div>
                    <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>National Emergency Ambulance Service — Free, 24/7</div>
                  </div>
                  <div className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#ef4444", color: "white" }}>
                    CALL NOW
                  </div>
                </a>

                {/* ── Option 2: Nearest Hospital on Google Maps ── */}
                <a href={nearestHospitalUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl transition-all"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.2)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={2}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ color: "#fbbf24" }}>🏥 Nearest Hospital</div>
                    <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      {emergStatus === "ready" && userLoc
                        ? "Opens Google Maps with hospitals near your location"
                        : "Opens Google Maps — allow location for best results"}
                    </div>
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={2} className="flex-shrink-0">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>

                {/* ── Option 3: Available UHCS Doctor ── */}
                <div className="p-4 rounded-xl"
                  style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)" }}>

                  {/* Locating state */}
                  {(emergStatus === "idle" || emergStatus === "locating") && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 rounded-full border-2"
                          style={{ borderColor: "#2a2d3e", borderTopColor: "#a855f7" }}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: "#c084fc" }}>👨‍⚕️ Finding Available UHCS Doctor...</div>
                        <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Getting your location to find nearest doctor</div>
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {emergStatus === "error" && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(168,85,247,0.15)" }}>
                        <span style={{ fontSize: "20px" }}>👨‍⚕️</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: "#c084fc" }}>👨‍⚕️ UHCS Doctor</div>
                        <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                          Allow location access to find nearest available doctor
                        </div>
                        <button onClick={() => navigate("/patient/find-doctors")}
                          className="mt-2 text-xs px-3 py-1 rounded-lg"
                          style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.4)", cursor: "pointer" }}>
                          Open Find Doctors →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ready — doctor found */}
                  {emergStatus === "ready" && nearestDoctor && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                          style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.4)" }}>
                          {nearestDoctor.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm" style={{ color: "#c084fc" }}>
                            Dr. {nearestDoctor.name}
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background: nearestDoctor.available !== false ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                                color:      nearestDoctor.available !== false ? "#10b981" : "#ef4444",
                              }}>
                              {nearestDoctor.available !== false ? "● Available" : "● Busy"}
                            </span>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                            {nearestDoctor.specialization || "General Physician"} · {nearestDoctor.hospital || ""}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {nearestDoctor.distance && (
                              <span className="text-xs" style={{ color: "#10b981" }}>
                                📍 {nearestDoctor.distance} km away
                              </span>
                            )}
                            {nearestDoctor.consultationFee > 0 && (
                              <span className="text-xs" style={{ color: "#f59e0b" }}>
                                ₹{nearestDoctor.consultationFee} fee
                              </span>
                            )}
                            {nearestDoctor.phone && (
                              <span className="text-xs" style={{ color: "#94a3b8" }}>
                                📞 {nearestDoctor.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Doctor action buttons */}
                      <div className="flex gap-2">
                        {nearestDoctor.phone && (
                          <a href={`tel:${nearestDoctor.phone}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                            style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.4)", textDecoration: "none" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.35)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; }}
                          >
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                            </svg>
                            Call Doctor
                          </a>
                        )}
                        {doctorDirectionsUrl && (
                          <a href={doctorDirectionsUrl} target="_blank" rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                            style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.4)", textDecoration: "none" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.35)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; }}
                          >
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                            </svg>
                            Get Directions
                          </a>
                        )}
                        <button onClick={() => navigate("/patient/find-doctors")}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                          style={{ background: "rgba(168,85,247,0.1)", color: "#94a3b8", border: "1px solid rgba(168,85,247,0.2)", cursor: "pointer" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.1)"; }}
                        >
                          View All →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ready — no UHCS doctor found */}
                  {emergStatus === "ready" && !nearestDoctor && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(168,85,247,0.15)" }}>
                        <span style={{ fontSize: "20px" }}>👨‍⚕️</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: "#c084fc" }}>No UHCS Doctors Nearby</div>
                        <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                          Use nearest hospital option above or call 108
                        </div>
                        <button onClick={() => navigate("/patient/find-doctors")}
                          className="mt-2 text-xs px-3 py-1 rounded-lg"
                          style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.4)", cursor: "pointer" }}>
                          Find Doctors →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          🗺️ GOLDEN Find Nearby Doctors Card
          ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        onClick={() => navigate("/patient/find-doctors")}
        className="mb-6 cursor-pointer relative overflow-hidden rounded-2xl"
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        style={{ background: NAVY }}
      >
        <div style={{ height: "4px", background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_DARK})` }} />
        <div className="relative overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_MID} 100%)`, padding: "24px 28px 20px" }}>
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${GOLD}15 0%, transparent 70%)`, transform: "translate(20%, -20%)" }} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)" }}>
              🗺️
            </div>
            <div className="flex-1">
              <p style={{ margin: "0 0 4px", fontSize: "10px", letterSpacing: "3px", color: GOLD, fontWeight: 600, textTransform: "uppercase" }}>
                Unified Health Care System
              </p>
              <div className="flex items-center gap-2">
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#FFFFFF" }}>Find Nearby Doctors</h3>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600, background: "rgba(201,168,76,0.2)", color: GOLD_LIGHT, border: "1px solid rgba(201,168,76,0.4)" }}>NEW</span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                UHCS registered doctors &amp; real hospitals near you
              </p>
            </div>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={GOLD} strokeWidth={2} className="flex-shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
        <div style={{ height: "2px", background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_DARK})` }} />
        <div style={{ background: "#FAFAF7", padding: "14px 28px 18px" }}>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { step: "1", label: "📍 Share location" },
              { step: "2", label: "🔍 Find doctors"   },
              { step: "3", label: "📋 View details"   },
              { step: "4", label: "🧭 Get directions" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: NAVY, fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {s.step}
                </div>
                <span style={{ fontSize: "12px", color: "#4A5568", fontWeight: 500 }}>{s.label}</span>
                {i < 3 && (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={GOLD} strokeWidth={2} style={{ margin: "0 4px" }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: "4px", background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_DARK})` }} />
      </motion.div>

      {/* ── Recent Records ── */}
      {!loading && recent.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="p-5 rounded-2xl mb-6"
          style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Recent Visits</span>
            <button onClick={() => navigate("/patient/timeline")}
              className="text-xs px-3 py-1 rounded-lg"
              style={{ background: "#a855f718", color: "#a855f7", border: "1px solid #a855f730" }}>
              Full Timeline →
            </button>
          </div>
          <div className="space-y-2">
            {recent.map((rec, i) => (
              <motion.div key={rec._id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "#252837" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "#a855f718", color: "#a855f7" }}>
                    {rec.doctor?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{rec.diagnosis}</div>
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
            <motion.button key={action.label}
              custom={i} variants={cardVariants} initial="hidden" animate="visible"
              whileHover={{ scale: 1.02, borderColor: action.color + "60" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="p-5 rounded-2xl text-left transition-all"
              style={{ background: "#1e2130", border: "1px solid #2a2d3e", cursor: "pointer" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: action.color + "18" }}>
                  {action.icon}
                </div>
                <div className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>{action.label}</div>
              </div>
              <div className="text-xs ml-12" style={{ color: "#64748b" }}>{action.desc}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </PageTransition>
  );
}