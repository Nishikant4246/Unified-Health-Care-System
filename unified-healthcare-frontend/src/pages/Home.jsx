import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/common/Logo";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const GOLD = "#C9A84C";
const EMERALD = "#10b981";

// ─── Line icons (single consistent style) ─────────────────────
const svg = (children) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IcoTimeline = svg(<><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>);
const IcoPin = svg(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></>);
const IcoRx = svg(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 12h5a2 2 0 0 1 0 4H8v-4Zm0 4 4 4" /></>);
const IcoShieldCheck = svg(<><path d="M12 3 5 6v5c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>);
const IcoUpload = svg(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8 12 3 7 8" /><path d="M12 3v13" /></>);
const IcoCard = svg(<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>);
const IcoId = svg(<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2.5" /><path d="M6 17a3 3 0 0 1 6 0M15 10h3M15 14h3" /></>);
const IcoMail = svg(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>);
const IcoPatient = svg(<><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></>);
const IcoDoctor = svg(<><path d="M5 4v5a5 5 0 0 0 10 0V4" /><path d="M5 4H3.5M15 4h1.5" /><path d="M10 14v2a4 4 0 0 0 8 0v-1" /><circle cx="18" cy="15" r="2" /></>);
const IcoAdmin = svg(<><path d="M12 3 5 6v5c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" /><circle cx="12" cy="10" r="2.4" /><path d="M8.5 16a3.6 3.6 0 0 1 7 0" /></>);

const services = [
  { icon: IcoTimeline, title: "Unified Medical Timeline", desc: "Every visit, diagnosis, prescription and report from every clinic — one chronological history under a single ID." },
  { icon: IcoPin, title: "Find Doctors Nearby", desc: "A GPS map of UHCS-registered doctors and real hospitals around you, with one-tap directions." },
  { icon: IcoRx, title: "Digital Prescriptions", desc: "Each consultation generates a clean prescription PDF — saved to the record and emailed to the patient." },
  { icon: IcoShieldCheck, title: "Verified Practitioners", desc: "Doctors are checked against the NMC register and their licence document before they are approved." },
  { icon: IcoUpload, title: "Import Past Reports", desc: "Patients upload older lab reports and documents, so nothing from before UHCS is left behind." },
  { icon: IcoCard, title: "Payments & History", desc: "Consultation fees and billing history tracked per visit and visible any time in your portal." },
  { icon: IcoId, title: "Universal Health ID", desc: "One Patient or Doctor ID that identifies you across every clinic on the platform." },
  { icon: IcoMail, title: "Email Notifications", desc: "Welcome messages, prescriptions and account approvals are delivered to your inbox automatically." },
];

const roles = [
  { icon: IcoPatient, title: "Patients", line: "View your complete timeline, upload past reports, track payments, and find doctors near you." },
  { icon: IcoDoctor, title: "Doctors", line: "Search patients by ID, add medical records, and issue digital prescriptions instantly." },
  { icon: IcoAdmin, title: "Administrators", line: "Verify practitioners, manage patients and doctors, and keep the platform trusted." },
];

const steps = [
  { n: "1", title: "Register once", desc: "Get a universal Patient or Doctor ID that works everywhere on UHCS." },
  { n: "2", title: "Care is recorded", desc: "Every visit, prescription and report is attached to that single ID." },
  { n: "3", title: "History follows you", desc: "Any authorised doctor opens your complete record — no forms, no gaps." },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const SHIELD_D =
  "M12 1.6c-.32 0-.63.06-.92.18L4.05 4.62C3.42 4.88 3 5.5 3 6.18v6.4c0 5.52 3.64 9.47 8.36 11.63.41.19.87.19 1.28 0C17.36 22.05 21 18.1 21 12.58v-6.4c0-.68-.42-1.3-1.05-1.56l-7.03-2.84c-.29-.12-.6-.18-.92-.18Z";

function Chip({ children, style, delay = 0, float = 8 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1, y: [0, float, 0] }}
      transition={{
        opacity: { duration: 0.4, delay },
        scale: { duration: 0.4, delay },
        y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay },
      }}
      style={{
        position: "absolute",
        padding: "7px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-primary)",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "0 10px 24px rgba(15,23,42,0.16)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// Floating 3-D-ish brand shield for the hero right column
function HeroShield() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      style={{
        position: "relative",
        width: 340,
        height: 340,
        maxWidth: "82vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 900,
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: i * 1.05, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 236,
            height: 236,
            borderRadius: "50%",
            border: "1px solid rgba(16,185,129,0.5)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%)",
        }}
      />

      <motion.div
        animate={{ y: [0, -12, 0], rotateY: [-7, 7, -7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 26px 50px rgba(16,185,129,0.4))",
        }}
      >
        <svg width="186" height="202" viewBox="0 0 24 26" fill="none">
          <defs>
            <linearGradient id="heroShieldGrad" x1="4" y1="2" x2="20" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#34d399" />
              <stop offset="0.5" stopColor="#10b981" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
          </defs>
          <path d={SHIELD_D} fill="url(#heroShieldGrad)" />
          <polyline
            points="5.4,19.3 9.2,19.3 10.8,16.4 12.8,21.4 14.3,19.3 18.4,19.3"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.45"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="10.15" y="5.6" width="3.7" height="11.8" rx="1.15" fill="#fff" />
          <rect x="6.6" y="9.65" width="10.8" height="3.7" rx="1.15" fill="#fff" />
          <path d={SHIELD_D} fill="none" stroke="#C9A84C" strokeOpacity="0.55" strokeWidth="0.7" />
        </svg>
      </motion.div>

      <Chip style={{ top: 22, right: 0 }} delay={0.3} float={8}>
        <span style={{ color: EMERALD, fontWeight: 800 }}>✓</span> Verified doctor
      </Chip>
      <Chip style={{ bottom: 54, left: -6 }} delay={0.6} float={-9}>
        <span style={{ fontFamily: "monospace", color: GOLD }}>PAT-0001</span>
      </Chip>
      <Chip style={{ bottom: 6, right: 34 }} delay={0.9} float={10}>
        🩺 One record, every clinic
      </Chip>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const [leaving, setLeaving] = useState(null);

  const dashPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "doctor"
      ? "/doctor/dashboard"
      : "/patient/dashboard";

  // Flip the "cover" open, then navigate
  const go = (path) => {
    if (user) return navigate(dashPath);
    setLeaving(path);
  };

  const primaryBtn = {
    padding: "12px 24px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    border: "1px solid transparent",
    background: EMERALD,
    color: "#fff",
  };

  return (
    <div style={{ perspective: 1600, background: "var(--bg-primary)", minHeight: "100vh" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={leaving ? { rotateY: -108, x: "-14%", opacity: 0.1 } : { opacity: 1, rotateY: 0, x: 0 }}
        transition={{ duration: leaving ? 0.55 : 0.4, ease: [0.4, 0, 0.2, 1] }}
        onAnimationComplete={() => leaving && navigate(leaving)}
        style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
      >
        {/* ── Top bar ─────────────────────────────────────── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "12px clamp(16px, 4vw, 40px) 12px 16px",
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Logo subtitle="Unified Health Care System" size={34} wordmarkSize={18} subtitleSize={11} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                padding: "6px 8px",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <option value="en">{t("languageEnglish")}</option>
              <option value="mr">{t("languageMarathi")}</option>
            </select>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
            <button onClick={() => go("/login")} style={primaryBtn}>
              {user ? "Go to Dashboard" : "Get Started"}
            </button>
          </div>
        </header>

        {/* ── Hero ────────────────────────────────────────── */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "clamp(44px, 8vw, 92px) clamp(16px, 5vw, 56px)",
            background: "linear-gradient(160deg, var(--bg-primary) 0%, var(--bg-secondary) 60%, var(--bg-primary) 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -140,
              left: -120,
              width: 460,
              height: 460,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              maxWidth: 1180,
              marginInline: "auto",
              display: "flex",
              alignItems: "center",
              gap: "clamp(24px, 6vw, 72px)",
              flexWrap: "wrap",
            }}
          >
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            style={{ flex: "1 1 440px", minWidth: 0, paddingLeft: "clamp(0px, 3vw, 40px)" }}
          >
            <motion.div
              variants={reveal}
              style={{
                fontSize: 12,
                letterSpacing: "0.22em",
                fontWeight: 700,
                color: EMERALD,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Unified Health Care System
            </motion.div>
            <motion.h1
              variants={reveal}
              style={{
                fontSize: "clamp(34px, 6vw, 60px)",
                lineHeight: 1.1,
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              One platform.
              <br />
              <span style={{ color: EMERALD }}>Complete care.</span>
            </motion.h1>
            <motion.p
              variants={reveal}
              style={{
                marginTop: 20,
                fontSize: "clamp(15px, 2.5vw, 18px)",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                maxWidth: 540,
              }}
            >
              Patients see multiple doctors across different clinics, but their records
              stay fragmented. UHCS unifies medical history under one universal ID — so
              every authorised provider gets the full picture, duplicate tests disappear,
              and care never starts from scratch.
            </motion.p>

            <motion.div variants={reveal} style={{ marginTop: 32 }}>
              <button onClick={() => go("/login")} style={primaryBtn}>
                Get Started
              </button>
            </motion.div>
          </motion.div>

          <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
            <HeroShield />
          </div>
          </div>
        </section>

        {/* ── Services ────────────────────────────────────── */}
        <section style={{ padding: "clamp(48px, 8vw, 88px) clamp(16px, 5vw, 56px)" }}>
          <SectionTitle kicker="What you get" title="Everything, in one place" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: (i % 4) * 0.05 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: "20px 18px",
                  borderRadius: 16,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: EMERALD,
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    marginBottom: 13,
                  }}
                >
                  {s.icon}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Built for everyone ──────────────────────────── */}
        <section
          style={{
            padding: "clamp(48px, 8vw, 88px) clamp(16px, 5vw, 56px)",
            background: "var(--bg-secondary)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <SectionTitle kicker="Built for everyone" title="One system, three roles" center />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginTop: 38,
              maxWidth: 960,
              marginInline: "auto",
            }}
          >
            {roles.map((r) => (
              <motion.div
                key={r.title}
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                style={{
                  padding: "30px 24px",
                  borderRadius: 18,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    color: EMERALD,
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.25)",
                  }}
                >
                  {r.icon}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>{r.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text-secondary)", marginTop: 8 }}>
                  {r.line}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How it works ────────────────────────────────── */}
        <section style={{ padding: "clamp(48px, 8vw, 88px) clamp(16px, 5vw, 56px)" }}>
          <SectionTitle kicker="How it works" title="Three steps, then it just follows you" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              marginTop: 34,
            }}
          >
            {steps.map((s) => (
              <motion.div
                key={s.n}
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                style={{ padding: "22px 20px", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    color: "#fff",
                    background: `linear-gradient(135deg, ${EMERALD}, #059669)`,
                    marginBottom: 12,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)" }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer
          style={{
            padding: "clamp(14px, 2vw, 22px) clamp(16px, 5vw, 40px)",
            background: "var(--bg-secondary)",
            borderTop: `2px solid ${GOLD}`,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ maxWidth: 340 }}>
              <Logo subtitle="Unified Health Care System" size={26} wordmarkSize={14} subtitleSize={9} />
              <p style={{ fontSize: 12, lineHeight: 1.55, color: "var(--text-secondary)", marginTop: 8 }}>
                Digitising and centralising patient medical history across hospitals and
                clinics — for continuity of care, fewer duplicate tests, and better
                diagnosis, with role-based data security.
              </p>
            </div>
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  margintop: 19,
                  marginBottom: 4,
                }}
              >
                Developer
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                Nishikant Vitthal Kshirsagar
              </div>
              
            </div>
          </div>
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid var(--border)",
              fontSize: 11.5,
              color: "var(--text-secondary)",
            }}
          >
            <b>© 2026 Unified Health Care System.</b> <b>This is Academic project</b>.
          </div>
        </footer>
      </motion.div>
    </div>
  );
}

function SectionTitle({ kicker, title, center }) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      style={center ? { textAlign: "center" } : undefined}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: EMERALD,
          marginBottom: 8,
        }}
      >
        {kicker}
      </div>
      <h2
        style={{
          fontSize: "clamp(22px, 4vw, 34px)",
          fontWeight: 800,
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        {title}
      </h2>
    </motion.div>
  );
}
