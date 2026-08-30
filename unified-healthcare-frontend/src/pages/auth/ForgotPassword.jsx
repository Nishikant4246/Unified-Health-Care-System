import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const inputStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-primary)" }}>
      <div
        className="w-full max-w-sm p-7 rounded-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Forgot password
        </h1>
        <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
          Enter your account email and we'll send a link to reset it.
        </p>

        {sent ? (
          <div
            className="p-4 rounded-xl text-sm leading-relaxed"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            If that email is registered, a password reset link is on its way. The link expires in 30&nbsp;minutes — check your spam folder if you don't see it.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {error && (
              <div
                className="p-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                {error}
              </div>
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{
                background: loading ? "#0d9268" : "#10b981",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.85 : 1,
              }}
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          <Link to="/login" className="font-semibold" style={{ color: "#10b981" }}>
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
