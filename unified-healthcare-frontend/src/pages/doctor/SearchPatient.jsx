import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { useLanguage } from "../../context/LanguageContext";

export default function SearchPatient() {
  const { t } = useLanguage();
  const [query, setQuery]       = useState("");
  const [patients, setPatients] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const navigate                = useNavigate();

  const inputStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setPatients([]);
    setSearched(false);
    try {
      // Works for both name and uniqueId — backend uses $or regex
      const res = await api.get(`/doctor/search-patient?query=${encodeURIComponent(q)}`);
      const data = res.data?.patients || res.data || [];
      setPatients(Array.isArray(data) ? data : [data]);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || "No patients found. Try a different name or ID.");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setPatients([]);
    setSearched(false);
    setError("");
  };

  return (
    <PageTransition>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          {t('searchPatient') }
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Find a patient by name or Patient ID (e.g. PAT0001)
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSearch}
        className="flex gap-3 mb-6"
      >
        <div className="relative flex-1">
          <div
            className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
            style={{ color: "#64748b" }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or Patient ID..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#10b981")}
            onBlur={(e)  => (e.target.style.borderColor = "#2a2d3e")}
          />
        </div>
        <motion.button
          type="submit"
          disabled={loading || !query.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-3 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
          style={{
            background: loading || !query.trim() ? "var(--bg-card)" : "#10b981",
            color:      loading || !query.trim() ? "var(--text-secondary)"  : "white",
            border: "1px solid " + (loading || !query.trim() ? "var(--border)" : "#10b981"),
            cursor: loading || !query.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </motion.button>
        {(query || searched) && (
          <motion.button
            type="button"
            onClick={handleClear}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-3 rounded-xl text-sm transition-all"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}
          >
            Clear
          </motion.button>
        )}
      </motion.form>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse"
              style={{ background: "var(--bg-card)", height: "88px", border: "1px solid var(--border)" }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl mb-4 text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171",
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {!loading && searched && patients.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-xs mb-3" style={{ color: "#64748b" }}>
              {patients.length} patient{patients.length > 1 ? "s" : ""} found
            </p>
            {patients.map((patient, i) => (
              <motion.div
                key={patient._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-5 rounded-2xl transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#10b98150";
                  e.currentTarget.style.background   = "var(--bg-card)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{ background: "#10b98118", color: "#10b981" }}
                    >
                      {patient.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-bold text-base mb-0.5" style={{ color: "var(--text-primary)" }}>
                        {patient.name}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{ background: "#3b82f618", color: "#3b82f6" }}
                        >
                          {patient.uniqueId}
                        </span>
                        {patient.phone && (
                          <span className="text-xs" style={{ color: "#64748b" }}>
                            📞 {patient.phone}
                          </span>
                        )}
                        <span className="text-xs" style={{ color: "#64748b" }}>
                          {patient.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate("/doctor/patients/" + patient._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "#3b82f618", color: "#3b82f6", border: "1px solid #3b82f630" }}
                    >
                      View Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate("/doctor/add-record", { state: { patient } })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "#10b981", color: "white" }}
                    >
                      + Add Record
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && searched && patients.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-10 rounded-2xl text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>No patient found</p>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Try a different name or Patient ID
          </p>
        </motion.div>
      )}

      {/* Initial hint */}
      {!searched && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-2xl text-center"
          style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}
        >
          <div className="text-3xl mb-3">👤</div>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Enter a patient name or ID above to search
          </p>
        </motion.div>
      )}
    </PageTransition>
  );
}