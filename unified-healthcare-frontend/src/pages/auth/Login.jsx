import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import nishikantImg from "../../assets/nishikant.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import Logo from "../../components/common/Logo";

// ─── Shared animation variants ───────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3 } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.5,  ease: [0.22, 1, 0.36, 1] } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.22 } },
  exit:   { opacity: 0, transition: { duration: 0.18 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.93, y: 20 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.18 } },
};

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [showPass,      setShowPass]      = useState(false);
  const [showAbout,     setShowAbout]     = useState(false);
  const [showContact,   setShowContact]   = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [aboutTab,      setAboutTab]      = useState("uhcs");
  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      ),
      title: "Universal Patient ID and Doctor ID",
      desc: "Every patient gets a unique ID that works across all clinics",
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
      ),
      title: "Complete Medical History",
      desc: "Doctors access full records from all previous clinics instantly",
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
      ),
      title: "Paperless & Eco-Friendly",
      desc: "Digital storage for reports, prescriptions and clinical notes",
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: "Reduced Redundancy",
      desc: "Eliminates repeated tests and delayed treatment across providers",
    },
  ];

  const goldGrad = "linear-gradient(135deg,#f6c90e 0%,#d4a017 40%,#f9d854 70%,#c8900a 100%)";

  const overlayBg = {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.80)", backdropFilter: "blur(7px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px",
  };

  const closeBtn = {
    position: "absolute", top: 16, right: 16, zIndex: 10,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "50%", width: 34, height: 34,
    color: "#94a3b8", fontSize: 20, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>

          <Link
            to="/"
            style={{
              position: "absolute", top: 14, left: 16, zIndex: 60,
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 600, textDecoration: "none",
              color: "var(--text-secondary)",
            }}
          >
            <span style={{ fontSize: 15 }}></span> Home
          </Link>

          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, alignItems: "center", zIndex: 60 }}>
            <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", padding: "6px 8px", borderRadius: 8 }}>
              <option value="en">{t('languageEnglish')}</option>
              <option value="mr">{t('languageMarathi')}</option>
            </select>
            <button onClick={toggleTheme} title="Toggle theme" style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>

          {/* ══════════════════ EMERGENCY MODAL ══════════════════ */}
      <AnimatePresence>
        {showEmergency && (
          <motion.div
            variants={overlayVariants} initial="hidden" animate="show" exit="exit"
            style={overlayBg} onClick={() => setShowEmergency(false)}
          >
            <motion.div
              variants={modalVariants} initial="hidden" animate="show" exit="exit"
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 420,
                              background: "var(--bg-card)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 18, padding: "28px 24px",
                boxShadow: "0 25px 80px rgba(239,68,68,0.12)",
                position: "relative",
              }}
            >
              <button onClick={() => setShowEmergency(false)} style={{ ...closeBtn, borderColor: "rgba(239,68,68,0.2)" }}>×</button>

              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 18 }}
                  style={{
                    width: 52, height: 52, borderRadius: 14, margin: "0 auto 12px",
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                  }}
                >🚨</motion.div>
                <div style={{ color: "#f87171", fontWeight: 800, fontSize: 18 }}>{t('emergencyHelp')}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{t('tapToCall')}</div>
              </div>

              <motion.div
                variants={stagger} initial="hidden" animate="show"
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[
                  { icon: "", label: t("emergencyNational"), number: "112", color: "#f87171", bg: "rgba(239,68,68,0.07)",   border: "rgba(239,68,68,0.2)"   },
                  { icon: "", label: t("ambulance"),          number: "108", color: "#fb923c", bg: "rgba(249,115,22,0.07)",  border: "rgba(249,115,22,0.2)"  },
                  { icon: "", label: t("medicalHelpline"),   number: "104", color: "#f472b6", bg: "rgba(244,114,182,0.07)", border: "rgba(244,114,182,0.2)" },
                  { icon: "", label: t("police"),             number: "100", color: "#60a5fa", bg: "rgba(59,130,246,0.07)",  border: "rgba(59,130,246,0.2)"  },
                  { icon: "", label: t("fireBrigade"),       number: "101", color: "#fbbf24", bg: "rgba(251,191,36,0.07)",  border: "rgba(251,191,36,0.2)"  },
                ].map(e => (
                  <motion.a
                    key={e.number} href={`tel:${e.number}`}
                    variants={fadeUp}
                    whileHover={{ scale: 1.02, opacity: 0.9 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "13px 16px", borderRadius: 12, textDecoration: "none",
                      background: e.bg, border: `1px solid ${e.border}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{e.icon}</span>
                      <div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 13 }}>{e.label}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 1 }}>{t("tapToCallShort")}</div>
                      </div>
                    </div>
                    <div style={{ color: e.color, fontWeight: 800, fontSize: 20, fontFamily: "monospace" }}>{e.number}</div>
                  </motion.a>
                ))}
              </motion.div>

              <p style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textAlign: "center", marginTop: 16, marginBottom: 0 }}>
                {t("stayCalmFull")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ ABOUT MODAL ══════════════════ */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            variants={overlayVariants} initial="hidden" animate="show" exit="exit"
            style={overlayBg} onClick={() => setShowAbout(false)}
          >
            <motion.div
              variants={modalVariants} initial="hidden" animate="show" exit="exit"
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 800, maxHeight: "90vh",
                background: "var(--modal-bg)",
                border: "1px solid rgba(16,185,129,0.18)",
                borderRadius: 20, overflowY: "auto",
                boxShadow: "0 30px 90px rgba(0,0,0,0.65)",
                position: "relative",
              }}
            >
              <button onClick={() => setShowAbout(false)} style={closeBtn}>×</button>

              {/* tabs */}
              <div style={{
                display: "flex", gap: 4, padding: "20px 24px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                {[
                  { key: "uhcs", label: `  ${t("aboutUHCS")}` },
                  { key: "dev",  label: `  ${t("developer")}`  },
                ].map(t => (
                  <button key={t.key} onClick={() => setAboutTab(t.key)} style={{
                    padding: "10px 22px", borderRadius: "10px 10px 0 0",
                    border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                    background: aboutTab === t.key ? "rgba(16,185,129,0.1)" : "transparent",
                    color: aboutTab === t.key ? "#10b981" : "var(--text-secondary)",
                    borderBottom: aboutTab === t.key ? "2px solid #10b981" : "2px solid transparent",
                    transition: "all 0.2s",
                  }}>{t.label}</button>
                ))}
              </div>

              {/* ── UHCS TAB ── */}
              <AnimatePresence mode="wait">
                {aboutTab === "uhcs" && (
                  <motion.div
                    key="uhcs"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    style={{ padding: "28px 28px 36px" }}
                  >
                    <motion.div
                      variants={fadeUp} initial="hidden" animate="show"
                      style={{
                        background: "linear-gradient(135deg,var(--bg-secondary),var(--bg-card))",
                        border: "1px solid rgba(16,185,129,0.15)",
                        borderRadius: 16, padding: "26px 22px", marginBottom: 24,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                        <Logo collapsed size={40} />
                        <div>
                          <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 19 }}>Unified Healthcare System</div>
                          <div style={{ color: "#10b981", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>UHCS · v2.0</div>
                        </div>
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                        UHCS digitizes and centralizes patient medical history across hospitals and clinics.
                        Patients often visit multiple doctors across different clinics, but their records remain
                        fragmented. UHCS solves this with a <strong style={{ color: "#10b981" }}>Universal Patient ID and Doctor ID</strong> — allowing
                        authorized providers to securely access complete records, eliminate duplicate tests,
                        and deliver faster, more accurate care.
                      </p>
                    </motion.div>

                    <h3 style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>Why UHCS?</h3>
                    <motion.div
                      variants={stagger} initial="hidden" animate="show"
                      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
                    >
                      {[
                        { icon: "", h: "Cross-Clinic History",  b: "Unifies all patient records across every clinic they've visited." },
                        { icon: "", h: "Better Diagnosis",      b: "Doctors get full context, reducing errors and improving accuracy." },
                        { icon: "", h: "No Repeated Tests",    b: "Eliminates redundant lab work that costs patients time and money." },
                        { icon: "", h: "Paperless Clinics",     b: "Eco-friendly digital records for prescriptions and reports." },
                        { icon: "", h: "Data Security",         b: "Role-based access ensures only authorized providers see data." },
                        { icon: "", h: "24/7 Record Access",    b: "Medical records available anytime — at any hospital or clinic." },
                      ].map(c => (
                        <motion.div
                          key={c.h} variants={fadeUp}
                          whileHover={{ scale: 1.03, borderColor: "rgba(16,185,129,0.3)" }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          style={{
                            padding: "14px 16px", borderRadius: 12,
                            background: "var(--bg-hover)",
                            border: "1px solid rgba(16,185,129,0.1)",
                            cursor: "default",
                          }}
                        >
                          <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
                          <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{c.h}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.6 }}>{c.b}</div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* ── DEVELOPER TAB ── */}
                {aboutTab === "dev" && (
                  <motion.div
                    key="dev"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    style={{ padding: "28px 28px 36px" }}
                  >
                    <motion.div
                      variants={scaleIn} initial="hidden" animate="show"
                      style={{
                        background: "linear-gradient(135deg,var(--bg-secondary) 0%,var(--bg-card) 100%)",
                        border: "1px solid rgba(212,160,23,0.35)",
                        borderRadius: 18, padding: "30px 26px",
                        position: "relative", overflow: "hidden",
                        boxShadow: "0 8px 40px rgba(212,160,23,0.08)",
                      }}
                    >
                      <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(246,201,14,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
                      <div style={{ position: "absolute", bottom: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(246,201,14,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />

                      <div style={{ display: "flex", gap: 22, alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                        <motion.div
                          whileHover={{ scale: 1.06 }}
                          transition={{ type: "spring", stiffness: 300, damping: 18 }}
                          style={{
                            width: 88, height: 88, borderRadius: 18, flexShrink: 0,
                            border: "2px solid rgba(212,160,23,0.45)",
                            overflow: "hidden", background: "var(--bg-hover)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 20px rgba(212,160,23,0.18)",
                          }}
                        >
                          <img
                            src={nishikantImg}
                            alt="Nishikant"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = `<span style="font-size:2.2rem">👨‍💻</span>`; }}
                          />
                        </motion.div>
                        <div style={{ flex: 1 }}>
                          <div style={{ background: goldGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 21, lineHeight: 1.2 }}>
                            Nishikant Vitthal Kshirsagar
                          </div>
                          <div style={{ color: "#d4a017", fontSize: 12, fontWeight: 600, marginTop: 5, letterSpacing: "0.07em" }}>
                            Software Engineer · Full Stack Developer
                          </div>
                          <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>📍 Pune, Maharashtra, India</div>
                        </div>
                      </div>

                      <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.8, marginTop: 20, position: "relative", zIndex: 1 }}>
                        I'm Nishikant Vitthal Kshirsagar, a passionate Software Developer who enjoys building clean, user-friendly web applications that solve real problems. I like taking ideas from concept to fully working products and continuously improving my skills through hands-on development. One of my key projects is the Unified Healthcare System (UHCS), which I designed and developed end-to-end to streamline interactions between patients, doctors, and administrators through an intuitive and efficient platform.
                      </p>

                      <motion.div
                        variants={stagger} initial="hidden" animate="show"
                        style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap", position: "relative", zIndex: 1 }}
                      >
                        {[
                          { label: "🌐 Portfolio", href: "https://nishikant-kshirsagar.is-a.dev" },
                          { label: "✉️ Email",     href: "mailto:nishikantkshirsagar22@gmail.com" },
                        ].map(l => (
                          <motion.a
                            key={l.label} href={l.href} target="_blank" rel="noreferrer"
                            variants={fadeUp}
                            whileHover={{ scale: 1.05, background: "rgba(212,160,23,0.2)" }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                              padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                              background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.28)",
                              color: "#d4a017", textDecoration: "none",
                            }}
                          >{l.label}</motion.a>
                        ))}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ CONTACT MODAL ══════════════════ */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            variants={overlayVariants} initial="hidden" animate="show" exit="exit"
            style={overlayBg} onClick={() => setShowContact(false)}
          >
            <motion.div
              variants={modalVariants} initial="hidden" animate="show" exit="exit"
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 380,
                background: "var(--modal-bg)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 18, padding: "28px 24px",
                boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
                position: "relative",
              }}
            >
              <button onClick={() => setShowContact(false)} style={closeBtn}>×</button>

              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 18 }}
                  style={{
                    width: 48, height: 48, borderRadius: 14, margin: "0 auto 12px",
                    background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </motion.div>
                <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 17 }}>{t("contactUs")}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>{t("contactUsSupport")}</div>
              </div>

              <motion.div
                variants={stagger} initial="hidden" animate="show"
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {[
                  { label: "Email",     email: "kshirsagarnishikant45@gmail.com"  },
            
                ].map(c => (
                  <motion.a
                    key={c.label} href={`mailto:${c.email}`}
                    variants={fadeUp}
                    whileHover={{ borderColor: "rgba(16,185,129,0.4)", scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", borderRadius: 12, textDecoration: "none",
                      background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)",
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.label}</div>
                      <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{c.email}</div>
                    </div>
                  </motion.a>
                ))}
              </motion.div>

              <p style={{ color: "var(--text-secondary)", fontSize: 11, textAlign: "center", marginTop: 18, marginBottom: 0 }}>
                {t("respondWithin")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ LEFT PANEL ══════════════════ */}
      <motion.div
        variants={slideLeft} initial="hidden" animate="show"
        className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,var(--bg-primary) 0%,var(--bg-secondary) 60%,var(--bg-primary) 100%)" }}
      >
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%)" }} />
        <div className="absolute bottom-[-80px] right-[-60px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(16,185,129,0.05) 0%,transparent 70%)" }} />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center gap-3 mb-10"
          >
            <Logo subtitle="Unified Healthcare System" size={38} wordmarkSize={19} subtitleSize={12} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-bold leading-tight mb-3" style={{ color: "var(--text-primary)" }}
          >
            One Platform.<br />
            <span style={{ color: "#10b981" }}>Complete Care.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.45 }}
            className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)", maxWidth: "380px" }}
          >
            Digitizing hospital and clinic operations by unifying patient medical history
            across multiple providers — ensuring continuity of care, reducing duplicate
            tests, and improving diagnosis accuracy while maintaining data security.
          </motion.p>

          <motion.div
            variants={stagger} initial="hidden" animate="show"
            transition={{ delayChildren: 0.32 }}
            className="space-y-4"
          >
            {features.map((f) => (
              <motion.div
                key={f.title} variants={fadeUp}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)" }}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>{f.title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <br/>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          className="relative z-10"
        >
          <div className="grid grid-cols-3 gap-3 mb-5 p-4 rounded-2xl"
            style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
            {[
              { value: "3",    label: "User Roles"    },
              { value: "100%", label: "Secure Access" },
              { value: "24/7", label: "Record Access" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.62 + i * 0.07, type: "spring", stiffness: 260, damping: 18 }}
                className="text-center"
              >
                <div className="text-xl font-bold" style={{ color: "#10b981" }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* ── 4 buttons: Emergency · About UHCS · Developer · Contact Us ── */}
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            transition={{ delayChildren: 0.68 }}
            style={{ display: "flex", gap: 8 }}
          >
            {/* 1. Emergency */}
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.04, background: "rgba(239,68,68,0.2)", borderColor: "rgba(239,68,68,0.5)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowEmergency(true)}
              style={{
                flex: 1, padding: "7px 10px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", cursor: "pointer",
              }}
            > Emergency</motion.button>

            {/* 2. About UHCS */}
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.04, background: "rgba(16,185,129,0.14)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setShowAbout(true); setAboutTab("uhcs"); }}
              style={{
                flex: 1, padding: "7px 10px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#10b981", cursor: "pointer",
              }}
            > About</motion.button>

            {/* 3. Developer */}
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.04, background: "rgba(246,201,14,0.15)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setShowAbout(true); setAboutTab("dev"); }}
              style={{
                flex: 1, padding: "7px 10px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                background: "rgba(246,201,14,0.07)",
                border: "1px solid rgba(246,201,14,0.22)",
                color: "#d4a017", cursor: "pointer",
              }}
            > Developer</motion.button>

            {/* 4. Contact Us */}
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.04, background: "rgba(16,185,129,0.14)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowContact(true)}
              style={{
                flex: 1, padding: "7px 10px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#10b981", cursor: "pointer",
              }}
            > Contact</motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ══════════════════ RIGHT PANEL ══════════════════ */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          transition={{ delayChildren: 0.15 }}
          className="w-full max-w-sm"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-2 mb-10 lg:hidden">
            <Logo size={30} wordmarkSize={16} />
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px" style={{ background: "#10b981" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#10b981" }}>
              {t("secureAccess")}
            </span>
          </motion.div>

          <motion.h2 variants={fadeUp} className="text-4xl font-black mb-3" style={{ color: "var(--text-primary)", lineHeight: 1.15 }}>
            {t("welcomeBackLogin")}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            {t("loginDescription")}
          </motion.p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="mb-5 p-4 rounded-xl flex items-center gap-3"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <svg width="16" height="16" fill="#ef4444" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm" style={{ color: "#f87171" }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-4 mb-6" autoComplete="on">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>{t("emailAddress")}</label>
              <input
                type="email" name="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                placeholder="you@example.com" required
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                onBlur={(e)  => (e.target.style.borderColor = "#252837")}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>{t("password")}</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password" autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl text-sm outline-none transition-all"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e)  => (e.target.style.borderColor = "#252837")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  style={{ color: "var(--text-secondary)" }}>
                  {showPass ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password" className="text-xs font-semibold" style={{ color: "#10b981" }}>
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02, background: "#0fcc8f" } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? "#0d9268" : "#10b981",
                color: "white", opacity: loading ? 0.85 : 1,
                cursor: loading ? "not-allowed" : "pointer", fontSize: "15px",
                border: "none",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/>
                  </svg>
                  {t("signingIn")}
                </>
              ) : (
                <>
                  {t("signIn")}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "#1e2130" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{t("noAccount")}</span>
            <div className="flex-1 h-px" style={{ background: "#1e2130" }} />
          </motion.div>

          <motion.div variants={stagger} className="space-y-3">
            <motion.div variants={fadeUp}>
              <Link to="/register"
                className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#10b98150")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2d3e")}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#a855f7" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{t("newPatient")}</div>
                  <div className="text-xs mt-0.5 font-semibold" style={{ color: "var(--text-secondary)" }}>{t("createPatientAccount")}</div>
                </div>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link to="/register-doctor"
                className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3b82f650")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2d3e")}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 4v5a5 5 0 0 0 10 0V4" />
                    <path d="M5 4H3.5M15 4h1.5" />
                    <path d="M10 14v2a4 4 0 0 0 8 0v-1" />
                    <circle cx="18" cy="15" r="2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{t("doctorProvider")}</div>
                  <div className="text-xs mt-0.5 font-semibold" style={{ color: "var(--text-secondary)" }}>{t("practitionerAccess")}</div>
                </div>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}