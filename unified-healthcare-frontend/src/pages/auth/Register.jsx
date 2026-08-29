import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";
import Logo from "../../components/common/Logo";
import { calcAge, calcBMI, bmiCategory } from "../../utils/health";

// ── Password strength ─────────────────────────────────────────
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))            score++;
  if (/[0-9]/.test(pw))            score++;
  if (/[^A-Za-z0-9]/.test(pw))     score++;
  const map = [
    { label: "",       color: ""        },
    { label: "Weak",   color: "#ef4444" },
    { label: "Fair",   color: "#f59e0b" },
    { label: "Good",   color: "#3b82f6" },
    { label: "Strong", color: "#10b981" },
  ];
  return { score, ...map[score] };
}

// ── Tooltip badge ─────────────────────────────────────────────
function SecureBadge({ tip }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
        style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", verticalAlign: "middle" }}
      >?</button>
      {show && (
        <div className="absolute z-50 bottom-6 left-0 w-52 p-2.5 rounded-xl text-xs leading-relaxed"
          style={{ background: "var(--bg-card)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--text-secondary)", whiteSpace: "normal" }}>
          {tip}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

export default function Register() {
  const { t } = useLanguage();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", dateOfBirth: "", heightCm: "", weightKg: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [touched,  setTouched]  = useState({});
  const [success,  setSuccess]  = useState(false);

  const set   = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const touch = (key)      => setTouched((p) => ({ ...p, [key]: true }));

  // ── Field validators ────────────────────────────────────────
  const fieldError = (key) => {
    if (!touched[key]) return "";
    switch (key) {
      case "name":
        return form.name.trim().length < 3
          ? "Name must be at least 3 characters" : "";
      case "email":
        return !/^[\x00-\x7F]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)
          ? "Enter a valid email address (e.g. name@example.com)" : "";
      case "phone":
        return !/^[6-9][0-9]{9}$/.test(form.phone)
          ? "Enter a valid 10-digit Indian mobile number" : "";
      case "password":
        if (form.password.length < 6) return "Minimum 6 characters required";
        if (!/[A-Z]/.test(form.password)) return "Add at least one uppercase letter";
        if (!/[0-9]/.test(form.password)) return "Add at least one number";
        return "";
      case "dateOfBirth":
        if (!form.dateOfBirth) return "Date of birth is required";
        return calcAge(form.dateOfBirth) == null ? "Enter a valid date of birth" : "";
      default: return "";
    }
  };

  const isFormValid = () =>
    !fieldError("name") && !fieldError("email") &&
    !fieldError("phone") && !fieldError("password") &&
    !fieldError("dateOfBirth") &&
    form.name && form.email && form.phone && form.password && form.dateOfBirth;

  const pwStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // touch all fields
    setTouched({ name: true, email: true, phone: true, password: true, dateOfBirth: true });

    if (!isFormValid()) {
      setError("Please fix the errors above before submitting.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { ...form, role: "patient" });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8"
              style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(16,185,129,0.12)", border: "2px solid rgba(16,185,129,0.3)" }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Account Created!
          </h1>
          <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
            Welcome to UHCS! Check your email for your welcome message.
          </p>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>

      {/* ── Left Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)" }}>
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #10b981, transparent)" }}/>
        <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #10b981, transparent)" }}/>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Logo subtitle="Unified Healthcare System" size={38} wordmarkSize={20} subtitleSize={12} />
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6" style={{ color: "var(--text-primary)" }}>
            Join the<br/>
            <span style={{ color: "#10b981" }}>Healthcare</span><br/>
            Network
          </h1>
          <p className="text-lg leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            Create your patient account and get instant access to your complete medical history.
          </p>

          {/* Privacy note */}
          <div className="p-4 rounded-xl"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div className="flex items-start gap-2">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2} className="flex-shrink-0 mt-0.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: "#10b981" }}>Privacy First</div>
                <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                  Your personal healthcare information stays protected. UHCS is designed to keep sensitive medical data secure and accessible only to authorized users. 
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Free to Join",    icon: "" },
            { label: "Instant Access",  icon: "" },
            { label: "Always Private",  icon: "" },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl text-center"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-xs font-medium" style={{ color: "#94a3b8" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {t("createAccount")}
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>{t("registerPatient")}</p>
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <svg width="18" height="18" fill="#ef4444" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm" style={{ color: "#ef4444" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "#94a3b8" }}>
                {t("fullName")}
                <SecureBadge tip="Use your real full name as it will appear on medical records." />
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                onBlur={() => touch("name")}
                placeholder="e.g. Nishikant Kshirsagar"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ ...inputStyle, borderColor: fieldError("name") ? "#ef4444" : "var(--border)" }}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              />
              {fieldError("name") && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("name")}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-primary)" }}>
                {t("emailAddress")}
                <SecureBadge tip="Use a real email — your welcome message and records will be sent here." />
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
                  style={{ color: "#64748b" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={254}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value.replace(/\s/g, "").toLowerCase())}
                  onBlur={() => touch("email")}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ ...inputStyle, borderColor: fieldError("email") ? "#ef4444" : "var(--border)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                />
                {/* live valid indicator */}
                {form.email && !fieldError("email") && touched.email && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>
              {fieldError("email") && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("email")}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "#94a3b8" }}>
                {t("phoneNumber")}
                <SecureBadge tip="10-digit Indian mobile number starting with 6, 7, 8 or 9." />
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
                  style={{ color: "#64748b", fontSize: "12px", fontWeight: 500 }}>
                  +91
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onBlur={() => touch("phone")}
                  placeholder="9325934246"
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-sm outline-none transition-all font-mono"
                  style={{ ...inputStyle, borderColor: fieldError("phone") ? "#ef4444" : "var(--border)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                />
                {/* digit counter */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-4"
                  style={{ color: form.phone.length === 10 ? "#10b981" : "#64748b", fontSize: "11px" }}>
                  {form.phone.length}/10
                </div>
              </div>
              {fieldError("phone") && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("phone")}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-primary)" }}>
                {t("password")}
                <SecureBadge tip="Use 8+ characters with uppercase, number, and symbol for best security." />
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
                  style={{ color: "#64748b" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  onBlur={() => touch("password")}
                  placeholder="Min 6 characters"
                  className="w-full pl-11 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ ...inputStyle, borderColor: fieldError("password") ? "#ef4444" : "var(--border)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  style={{ color: "#64748b" }}>
                  {showPass
                    ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: pwStrength.score >= i ? pwStrength.color : "var(--border)" }}/>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: pwStrength.color }}>
                      {pwStrength.label && `${pwStrength.label} password`}
                    </p>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      {!(/[A-Z]/.test(form.password)) && "Add uppercase · "}
                      {!(/[0-9]/.test(form.password)) && "Add number · "}
                      {!(/[^A-Za-z0-9]/.test(form.password)) && "Add symbol"}
                    </p>
                  </div>
                </div>
              )}
              {fieldError("password") && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("password")}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                Date of Birth
                <SecureBadge tip="Used to calculate your age on medical records. Required." />
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => set("dateOfBirth", e.target.value)}
                onBlur={() => touch("dateOfBirth")}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ ...inputStyle, borderColor: fieldError("dateOfBirth") ? "#ef4444" : "var(--border)" }}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              />
              {form.dateOfBirth && calcAge(form.dateOfBirth) != null && (
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                  Age: {calcAge(form.dateOfBirth)} years
                </p>
              )}
              {fieldError("dateOfBirth") && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("dateOfBirth")}</p>
              )}
            </div>

            {/* Height + Weight (optional) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  Height (cm)
                  <span className="normal-case font-normal" style={{ color: "#64748b" }}> · optional</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.heightCm}
                  onChange={(e) => set("heightCm", e.target.value)}
                  placeholder="e.g. 170"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  Weight (kg)
                  <span className="normal-case font-normal" style={{ color: "#64748b" }}> · optional</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.weightKg}
                  onChange={(e) => set("weightKg", e.target.value)}
                  placeholder="e.g. 65"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>
            {(() => {
              const b = calcBMI(form.heightCm, form.weightKg);
              const c = bmiCategory(b);
              return b != null ? (
                <p className="text-xs" style={{ color: "#64748b" }}>
                  BMI: <span style={{ color: c?.color, fontWeight: 600 }}>{b} · {c?.label}</span>
                </p>
              ) : null;
            })()}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2 flex items-center justify-center gap-2"
              style={{
                background: loading ? "#0d9268" : "#10b981",
                color: "white",
                opacity: loading ? 0.8 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/>
                  </svg>
                  Creating Account...
                </>
              ) : t("createAccount")}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("noAccount")}{" "}
            <Link to="/" className="font-semibold" style={{ color: "#10b981" }}>{t("signIn")}</Link>
          </p>
          <p className="mt-3 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Are you a doctor?{" "}
            <Link to="/register-doctor" className="font-semibold" style={{ color: "#10b981" }}>Apply here</Link>
          </p>

        </div>
      </div>
    </div>
  );
}