import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);

  const [name,    setName]    = useState(user?.name  || "");
  const [phone,   setPhone]   = useState(user?.phone || "");
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const inputStyle = {
    background: "var(--bg-card)",
    border:     "1px solid var(--border)",
    color:      "var(--text-primary)",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res         = await api.put("/patient/update-profile", { name, phone });
      const updatedUser = { ...user, name: res.data.user.name, phone: res.data.user.phone };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // How long ago the account was created
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
    : "—";

  return (
    <PageTransition>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>My Profile</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Manage your personal information</p>
      </motion.div>

      {/* ── Avatar / Identity card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-6 rounded-2xl mb-4 relative overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid rgba(168,85,247,0.2)" }}
      >
        {/* bg accent */}
        <div
          className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)",
            transform: "translate(30%,-30%)",
          }}
        />
        <div className="relative flex items-center gap-5">
          {/* Avatar with initials */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-18 h-18 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
            style={{
              width: "72px", height: "72px",
              background: "linear-gradient(135deg, #a855f7, #7c3aed)",
              color: "white",
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {user?.name}
            </h2>
            <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
              >
                {user?.uniqueId}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
              >
                ● Active
              </span>
            </div>
          </div>

          {/* Member since */}
          <div className="text-right hidden sm:block flex-shrink-0">
            <div className="text-xs" style={{ color: "#64748b" }}>Member since</div>
            <div className="text-sm font-medium mt-0.5" style={{ color: "#94a3b8" }}>{memberSince}</div>
          </div>
        </div>
      </motion.div>

      {/* ── Account info (read-only) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl mb-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#64748b" }}>
          Account Information
        </h3>
        <div className="space-y-0">
          {[
            { label: "Email",      value: user?.email,    mono: true  },
            { label: "Patient ID", value: user?.uniqueId, mono: true  },
            { label: "Role",       value: "Patient",      mono: false },
          ].map((field, i, arr) => (
            <div
              key={field.label}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid #2a2d3e" : "none" }}
            >
              <span className="text-sm" style={{ color: "#64748b" }}>{field.label}</span>
              <span
                className="text-sm font-medium"
                style={{ color: "#94a3b8", fontFamily: field.mono ? "monospace" : "inherit" }}
              >
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Edit form ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#64748b" }}>
          Edit Information
        </h3>

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Profile updated successfully
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#94a3b8" }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
              onBlur={(e)  => (e.target.style.borderColor = "#2a2d3e")}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#94a3b8" }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
              onBlur={(e)  => (e.target.style.borderColor = "#2a2d3e")}
            />
          </div>

          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.01 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all mt-2"
            style={{
              background: saving ? "#7c3aed" : "#a855f7",
              color:      "white",
              opacity:    saving ? 0.8 : 1,
              cursor:     saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </form>
      </motion.div>
    </PageTransition>
  );
}