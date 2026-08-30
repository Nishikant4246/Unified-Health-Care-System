import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

const inputStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const pwError = () => {
    if (pw.length < 6) return "Minimum 6 characters";
    if (!/[A-Z]/.test(pw)) return "Add at least one uppercase letter";
    if (!/[0-9]/.test(pw)) return "Add at least one number";
    if (/\s/.test(pw)) return "Password cannot contain spaces";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const pe = pwError();
    if (pe) return setError(pe);
    if (pw !== confirm) return setError("Passwords do not match");

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: pw });
      setDone(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset the password.");
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
          Set a new password
        </h1>
        <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
          Choose a strong password with an uppercase letter and a number.
        </p>

        {done ? (
          <div
            className="p-4 rounded-xl text-sm"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            Password updated. Taking you to sign in…
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
              type={show ? "text" : "password"}
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <input
              type={show ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <label className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
              Show password
            </label>
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
              {loading ? "Updating…" : "Update password"}
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
