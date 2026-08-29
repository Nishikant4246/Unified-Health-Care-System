import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";
import Logo from "../../components/common/Logo";

const inputStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

const qualifications = ["MBBS", "MD", "MS", "DM", "BDS", "MDS", "BAMS", "BHMS", "DNB", "MCh"];

const specializations = [
  "General Physician", "Cardiologist", "Dermatologist", "Neurologist",
  "Orthopedic", "Pediatrician", "Gynecologist", "ENT Specialist",
  "Ophthalmologist", "Psychiatrist", "Oncologist", "Radiologist",
  "Urologist", "Nephrologist", "Gastroenterologist", "Pulmonologist",
  "Endocrinologist", "Rheumatologist", "General Surgeon", "Anesthesiologist",
];

// ── Password strength checker ────────────────────────────────
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)               score++;
  if (/[A-Z]/.test(pw))             score++;
  if (/[0-9]/.test(pw))             score++;
  if (/[^A-Za-z0-9]/.test(pw))      score++;
  const map = [
    { label: "",          color: ""         },
    { label: "Weak",      color: "#ef4444"  },
    { label: "Fair",      color: "#f59e0b"  },
    { label: "Good",      color: "#3b82f6"  },
    { label: "Strong",    color: "#10b981"  },
  ];
  return { score, ...map[score] };
}

// ── Security tip tooltip ─────────────────────────────────────
function SecureBadge({ tip }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
        style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6", verticalAlign: "middle" }}
      >
        ?
      </button>
      {show && (
        <div
          className="absolute z-50 bottom-6 left-0 w-52 p-2.5 rounded-xl text-xs leading-relaxed"
          style={{ background: "var(--bg-card)", border: "1px solid #3b82f630", color: "var(--text-secondary)", whiteSpace: "normal" }}
        >
          {tip}
        </div>
      )}
    </div>
  );
}

export default function RegisterDoctor() {
  const { t } = useLanguage();
  const [step,      setStep]      = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [touched,   setTouched]   = useState({});
  const [licenseFile, setLicenseFile] = useState(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", gender: "",
    specialization: "", qualification: "", licenseNumber: "",
    experience: "", hospital: "", consultationFee: "",
    bio: "",
    education: [{ degree: "", institution: "", year: "" }],
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const touch = (key) => setTouched((prev) => ({ ...prev, [key]: true }));

  const setEducation = (index, key, value) => {
    const updated = [...form.education];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, education: updated }));
  };

  const addEducation = () =>
    setForm((prev) => ({ ...prev, education: [...prev.education, { degree: "", institution: "", year: "" }] }));

  const removeEducation = (index) =>
    setForm((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));

  // ── Field-level validators ──────────────────────────────────
  const fieldError = (key) => {
    if (!touched[key]) return "";
    switch (key) {
      case "name":
        return form.name.trim().length < 3 ? "Min 3 characters required" : "";
      case "email":
        return !/^[\x00-\x7F]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email) ? "Enter a valid email address" : "";
      case "phone":
        return !/^[6-9][0-9]{9}$/.test(form.phone) ? "Enter a valid 10-digit Indian mobile number" : "";
      case "password": {
        if (form.password.length < 6) return "Min 6 characters required";
        if (!/[A-Z]/.test(form.password)) return "Add at least one uppercase letter";
        if (!/[0-9]/.test(form.password)) return "Add at least one number";
        return "";
      }
      case "licenseNumber":
        return !form.licenseNumber.trim() ? "License number is required" : "";
      case "experience":
        return !form.experience || isNaN(form.experience) || Number(form.experience) < 0
          ? "Enter valid years (0 or more)" : "";
      case "hospital":
        return !form.hospital.trim() ? "Hospital / Clinic name is required" : "";
      default:
        return "";
    }
  };

  // ── Step validation ─────────────────────────────────────────
  const validateStep = () => {
    setError("");
    if (step === 1) {
      const keys = ["name", "email", "phone", "password"];
      setTouched((prev) => ({ ...prev, ...Object.fromEntries(keys.map((k) => [k, true])) }));
      if (form.name.trim().length < 3)                         { setError("Name must be at least 3 characters"); return false; }
      if (!/^[\x00-\x7F]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) { setError("Enter a valid email address"); return false; }
      if (!/^[6-9][0-9]{9}$/.test(form.phone))                { setError("Enter a valid 10-digit mobile number"); return false; }
      if (form.password.length < 6)                           { setError("Password must be at least 6 characters"); return false; }
      if (!/[A-Z]/.test(form.password))                       { setError("Password needs at least one uppercase letter"); return false; }
      if (!/[0-9]/.test(form.password))                       { setError("Password needs at least one number"); return false; }
    }
    if (step === 2) {
      if (!form.specialization)                               { setError("Please select a specialization"); return false; }
      if (!form.qualification)                                { setError("Please select your qualification"); return false; }
      if (!form.licenseNumber.trim())                         { setError("Medical license number is required"); return false; }
      if (!form.experience || isNaN(form.experience))         { setError("Enter valid years of experience"); return false; }
      if (!form.hospital.trim())                              { setError("Hospital / Clinic name is required"); return false; }
      if (!licenseFile)                                       { setError("Please upload a photo or PDF of your medical license"); return false; }
    }
    if (step === 3) {
      const valid = form.education.filter((e) => e.degree && e.institution && e.year);
      if (valid.length === 0)                                 { setError("Add at least one complete education entry"); return false; }
    }
    return true;
  };

  const handleNext  = () => { if (validateStep()) setStep((s) => s + 1); };
  const handleBack  = () => { setError(""); setStep((s) => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const validEducation = form.education.filter((e) => e.degree && e.institution && e.year);
      const data = new FormData();
      data.append("name",            form.name);
      data.append("email",           form.email);
      data.append("phone",           form.phone);
      data.append("password",        form.password);
      data.append("gender",          form.gender || "");
      data.append("specialization",  form.specialization);
      data.append("qualification",   form.qualification);
      data.append("licenseNumber",   form.licenseNumber);
      data.append("experience",      Number(form.experience));
      data.append("hospital",        form.hospital);
      data.append("consultationFee", Number(form.consultationFee) || 0);
      data.append("bio",             form.bio || "");
      data.append("education",        JSON.stringify(validEducation));
      if (licenseFile) data.append("licenseImage", licenseFile);

      await api.post("/auth/register-doctor", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(form.password);

  // ── Success Screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(251,191,36,0.12)", border: "2px solid rgba(251,191,36,0.3)" }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Application Submitted!</h1>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            Your doctor registration has been submitted and is pending admin review.
            You will be able to login once approved.
          </p>
          <div className="p-4 rounded-xl mb-8"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#fbbf24" }}/>
              <span className="text-sm font-medium" style={{ color: "#fbbf24" }}>Awaiting Admin Approval</span>
            </div>
          </div>
          <Link to="/login" className="inline-block w-full py-3 rounded-xl font-semibold text-sm text-center"
            style={{ background: "#10b981", color: "white" }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  const steps = ["Personal Info", "Professional", "Education"];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex w-2/5 flex-col justify-between p-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)" }}>
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}/>
        <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}/>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Logo subtitle="Unified Healthcare System" size={38} wordmarkSize={20} subtitleSize={12} />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-6" style={{ color: "var(--text-primary)" }}>
            Join as a<br/><span style={{ color: "#3b82f6" }}>Verified</span><br/>Doctor
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            Complete your professional profile to apply. All credentials are verified by our admin team before approval.
          </p>

          {/* Security note on left */}
          <div className="p-4 rounded-xl"
            style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="flex items-start gap-2">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2} className="flex-shrink-0 mt-0.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: "#3b82f6" }}>Data Security</div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Your information is encrypted and stored securely. License numbers and credentials are only visible to verified admins.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-4 p-4 rounded-xl transition-all"
              style={{
                background: step === i + 1 ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.05)",
                border: `1px solid ${step === i + 1 ? "rgba(59,130,246,0.4)" : "rgba(59,130,246,0.1)"}`,
              }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: step > i + 1 ? "#10b981" : step === i + 1 ? "#3b82f6" : "var(--border)", color: "white" }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <div className="text-sm font-semibold" style={{ color: step === i + 1 ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in">

          {/* Mobile step bar */}
          <div className="flex gap-2 mb-8 lg:hidden">
            {steps.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all"
                style={{ background: step > i ? "#3b82f6" : "var(--border)" }}/>
            ))}
          </div>

          <div className="mb-8">
            <p className="text-xs font-medium mb-1" style={{ color: "#3b82f6" }}>Step {step} of {steps.length}</p>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{steps[step - 1]}</h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {step === 1 && "Your basic personal information — kept private and encrypted"}
              {step === 2 && "Your medical credentials and current practice details"}
              {step === 3 && "Your education background and professional summary"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <svg width="16" height="16" fill="#ef4444" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm" style={{ color: "#f87171" }}>{error}</span>
            </div>
          )}

          {/* ══ STEP 1 ══ */}
          {step === 1 && (
            <div className="space-y-4">

              {/* GDPR / privacy notice */}
              <div className="p-3 rounded-xl flex items-start gap-2 mb-2"
                style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2} className="flex-shrink-0 mt-0.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Your personal data is collected solely for verification and access purposes. It is never shared with third parties.
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  Full Name
                  <SecureBadge tip="Use your real name as it appears on your medical license." />
                </label>
                <input type="text" value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  onBlur={() => touch("name")}
                  placeholder="Dr. Rohit Sharma"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ ...inputStyle, borderColor: fieldError("name") && touched.name ? "#ef4444" : "var(--border)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                />
                {fieldError("name") && touched.name && (
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("name")}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  {t("emailAddress")}
                  <SecureBadge tip="Use a professional email. Admin approval notifications will be sent here." />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none" style={{ color: "#64748b" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input type="email" inputMode="email" autoComplete="email" maxLength={254}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value.replace(/\s/g, "").toLowerCase())}
                    onBlur={() => touch("email")}
                    placeholder="doctor@hospital.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ ...inputStyle, borderColor: fieldError("email") && touched.email ? "#ef4444" : "var(--border)" }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  />
                </div>
                {fieldError("email") && touched.email && (
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("email")}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  Phone Number
                  <SecureBadge tip="10-digit Indian mobile number. Must start with 6, 7, 8 or 9." />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
                    style={{ color: "#64748b", fontSize: "12px", fontWeight: 500 }}>
                    +91
                  </div>
                  <input type="tel" value={form.phone}
                    onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onBlur={() => touch("phone")}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all font-mono"
                    style={{ ...inputStyle, borderColor: fieldError("phone") && touched.phone ? "#ef4444" : "var(--border)" }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  />
                  {/* live digit count */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4"
                    style={{ color: form.phone.length === 10 ? "#10b981" : "#64748b", fontSize: "11px" }}>
                    {form.phone.length}/10
                  </div>
                </div>
                {fieldError("phone") && touched.phone && (
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("phone")}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  {t("password")}
                  <SecureBadge tip="Use 8+ chars with uppercase, number and symbol for best security." />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none" style={{ color: "#64748b" }}>
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
                    style={{ ...inputStyle, borderColor: fieldError("password") && touched.password ? "#ef4444" : "var(--border)" }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4" style={{ color: "#64748b" }}>
                    {showPass
                      ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>

                {/* Password strength bar */}
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
                {fieldError("password") && touched.password && (
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("password")}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  Gender
                </label>
                <select value={form.gender} onChange={(e) => set("gender", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* ══ STEP 2 ══ */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>Specialization</label>
                <select value={form.specialization} onChange={(e) => set("specialization", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle}>
                  <option value="">Select specialization</option>
                  {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>Highest Qualification</label>
                <select value={form.qualification} onChange={(e) => set("qualification", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle}>
                  <option value="">Select qualification</option>
                  {qualifications.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  Medical License Number
                  <SecureBadge tip="MCI or State Medical Council registration number. Only visible to admin." />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none" style={{ color: "#64748b" }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                  <input type="text" value={form.licenseNumber}
  onChange={(e) => set("licenseNumber", e.target.value.toUpperCase())}
  placeholder="e.g. MH-2019-12345"
  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none font-mono"
  style={inputStyle}
  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
  onBlur={(e) => { touch("licenseNumber"); e.target.style.borderColor = "#2a2d3e"; }}
/>
                </div>
                {fieldError("licenseNumber") && touched.licenseNumber && (
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("licenseNumber")}</p>
                )}
              </div>

              {/* Medical License — photo / scan (required for verification) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  Medical License — Photo / Scan
                  <SecureBadge tip="Upload a clear photo or PDF scan of your medical registration certificate. Only admins can view it, and it is used to verify you are a registered practitioner." />
                </label>
                <div className="relative border-2 border-dashed rounded-xl p-4 text-center transition-all"
                  style={{ borderColor: licenseFile ? "#10b981" : "#2a2d3e" }}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {licenseFile ? (
                    <p className="text-sm font-medium" style={{ color: "#10b981" }}>
                      📎 {licenseFile.name}
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: "#94a3b8" }}>
                      Click to upload your license certificate (JPG, PNG or PDF)
                    </p>
                  )}
                </div>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                  Required — helps the admin team confirm your registration before approval.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>Experience (yrs)</label>
                  <input type="number" min="0" max="60" value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                    onBlur={() => touch("experience")}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  />
                  {fieldError("experience") && touched.experience && (
                    <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("experience")}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>Consult Fee (₹)</label>
                  <input type="number" min="0" value={form.consultationFee}
                    onChange={(e) => set("consultationFee", e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>Hospital / Clinic Name</label>
                <input type="text" value={form.hospital}
                  onChange={(e) => set("hospital", e.target.value)}
                  onBlur={() => touch("hospital")}
                  placeholder="e.g. City General Hospital, Pune"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                />
                {fieldError("hospital") && touched.hospital && (
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>⚠ {fieldError("hospital")}</p>
                )}
              </div>
            </div>
          )}

          {/* ══ STEP 3 ══ */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Education</label>
                  <button type="button" onClick={addEducation}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    + Add More
                  </button>
                </div>
                <div className="space-y-3">
                  {form.education.map((edu, idx) => (
                    <div key={idx} className="p-4 rounded-xl relative"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 4px 14px rgba(15,23,42,0.05)" }}>
                      {form.education.length > 1 && (
                        <button type="button" onClick={() => removeEducation(idx)}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                          ✕
                        </button>
                      )}
                      <div className="grid grid-cols-1 gap-3">
                        <input type="text" placeholder="Degree (e.g. MBBS, MD)" value={edu.degree}
                          onChange={(e) => setEducation(idx, "degree", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                          onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}/>
                        <input type="text" placeholder="Institution (e.g. AIIMS Delhi)" value={edu.institution}
                          onChange={(e) => setEducation(idx, "institution", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                          onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}/>
                        <input type="text" placeholder="Year of Passing (e.g. 2018)" value={edu.year}
                          onChange={(e) => setEducation(idx, "year", e.target.value.replace(/\D/g, "").slice(0, 4))}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono" style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                          onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#94a3b8" }}>
                  Professional Bio <span className="normal-case font-normal" style={{ color: "#64748b" }}>(optional)</span>
                </label>
                <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
                  placeholder="Briefly describe your expertise, approach, and notable achievements..."
                  rows={4} maxLength={500}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}/>
                <p className="text-xs mt-1 text-right" style={{ color: "#64748b" }}>{form.bio.length}/500</p>
              </div>

              {/* Consent + warning */}
              <div className="p-4 rounded-xl space-y-3"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <div className="flex items-start gap-2">
                  <svg width="15" height="15" fill="#fbbf24" viewBox="0 0 20 20" className="flex-shrink-0 mt-0.5">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-xs leading-relaxed" style={{ color: "#fbbf24" }}>
                    All credentials including license number and education will be verified by the admin before approval.
                    Providing false information may result in permanent rejection.
                  </p>
                </div>
                <div className="flex items-start gap-2 pt-2" style={{ borderTop: "1px solid rgba(251,191,36,0.1)" }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2} className="flex-shrink-0 mt-0.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                    By submitting, you consent to UHCS storing and processing your professional data for verification and healthcare management purposes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button type="button" onClick={handleBack}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(15,23,42,0.06)" }}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={handleNext}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: "#2563eb", color: "white", border: "1px solid #1d4ed8", boxShadow: "0 6px 16px rgba(37,99,235,0.22)" }}>
                Continue →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: loading ? "#1d4ed8" : "#2563eb", color: "white", border: "1px solid #1d4ed8", boxShadow: "0 6px 16px rgba(37,99,235,0.22)", opacity: loading ? 0.8 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? (
                  <><svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/></svg>Submitting...</>
                ) : "Submit Application"}
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: "#94a3b8" }}>
            Already approved?{" "}
            <Link to="/login" className="font-semibold" style={{ color: "#3b82f6" }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}