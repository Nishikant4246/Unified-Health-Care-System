import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

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
      title: "Universal Patient ID",
      desc:  "Every patient gets a unique ID that works across all clinics",
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
      desc:  "Doctors access full records from all previous clinics instantly",
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
      ),
      title: "Paperless & Eco-Friendly",
      desc:  "Digital storage for reports, prescriptions and clinical notes",
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: "Reduced Redundancy",
      desc:  "Eliminates repeated tests and delayed treatment across providers",
    },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#0f1117" }}>

      {/* ── LEFT PANEL (unchanged) ── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0f1117 0%, #0d1f14 60%, #0f1117 100%)" }}
      >
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-80px] right-[-60px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#10b981" }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.3"/>
                <path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-tight">UHCS</div>
              <div className="text-xs" style={{ color: "#4b7a62" }}>Unified Healthcare System</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-3" style={{ color: "#f1f5f9" }}>
            One Platform.<br />
            <span style={{ color: "#10b981" }}>Complete Care.</span>
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#64748b", maxWidth: "380px" }}>
            Digitizing hospital and clinic operations by unifying patient medical history
            across multiple providers — ensuring continuity of care, reducing duplicate
            tests, and improving diagnosis accuracy while maintaining data security.
          </p>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)" }}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: "#e2e8f0" }}>{f.title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-3 mb-4 p-4 rounded-2xl"
            style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
            {[
              { value: "3",    label: "User Roles"    },
              { value: "100%", label: "Secure Access" },
              { value: "24/7", label: "Record Access" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-bold" style={{ color: "#10b981" }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#4b7a62" strokeWidth={2}>
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
              </svg>
              <span className="text-xs" style={{ color: "#4b7a62" }}>Cloud Storage · Cloudinary</span>
            </div>
            <span className="text-xs" style={{ color: "#374151" }}>— Nishikant V Kshirsagar</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (matches screenshot exactly) ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#10b981" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-base" style={{ color: "#f1f5f9" }}>UHCS</span>
          </div>

          {/* — SECURE ACCESS label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px" style={{ background: "#10b981" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#10b981" }}>
              Secure Access
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-black mb-3" style={{ color: "#f1f5f9", lineHeight: 1.15 }}>
            Welcome back
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#64748b" }}>
            Sign in to access your unified health records, appointments, and care history.
          </p>

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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                style={{
                  background: "#1a1d2e",
                  border: "1px solid #252837",
                  color: "#f1f5f9",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                onBlur={(e)  => (e.target.style.borderColor = "#252837")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl text-sm outline-none transition-all"
                  style={{
                    background: "#1a1d2e",
                    border: "1px solid #252837",
                    color: "#f1f5f9",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e)  => (e.target.style.borderColor = "#252837")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  style={{ color: "#64748b" }}
                >
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

            {/* Sign In button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? "#0d9268" : "#10b981",
                color:   "white",
                opacity: loading ? 0.85 : 1,
                cursor:  loading ? "not-allowed" : "pointer",
                fontSize: "15px",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "#1e2130" }} />
            <span className="text-xs" style={{ color: "#64748b" }}>Don't have an account?</span>
            <div className="flex-1 h-px" style={{ background: "#1e2130" }} />
          </div>

          {/* Register options — list style matching screenshot */}
          <div className="space-y-3">
            {/* New Patient */}
            <Link
              to="/register"
              className="flex items-center gap-4 p-4 rounded-2xl transition-all"
              style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#10b98150")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2d3e")}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "rgba(168,85,247,0.1)" }}
              >
                🧑‍⚕️
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: "#f1f5f9" }}>New Patient</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>Create your patient account</div>
              </div>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>

            {/* Doctor */}
            <Link
              to="/register-doctor"
              className="flex items-center gap-4 p-4 rounded-2xl transition-all"
              style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3b82f650")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2d3e")}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.1)" }}
              >
                👨‍⚕️
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: "#f1f5f9" }}>Doctor / Provider</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>Apply for practitioner access</div>
              </div>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}