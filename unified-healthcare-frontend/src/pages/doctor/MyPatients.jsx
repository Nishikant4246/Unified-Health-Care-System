import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";

export default function MyPatients() {
  const [patients,     setPatients]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [error,        setError]        = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/doctor/my-patients")
      .then((res) => setPatients(res.data?.patients || res.data || []))
      .catch((err) => {
        console.error(err);
        setError("Failed to load patients.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.uniqueId?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  return (
    <PageTransition>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          My Patients
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          All patients you have treated
        </p>
      </motion.div>

      {/* Search + count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="relative flex-1">
          <div
            className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
            style={{ color: "#64748b" }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name, ID or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#10b981")}
            onBlur={(e)  => (e.target.style.borderColor = "#2a2d3e")}
          />
        </div>
        {!loading && (
          <span
            className="text-xs px-3 py-2 rounded-xl flex-shrink-0"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <div
          className="mb-4 p-4 rounded-xl text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
        >
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse"
              style={{ background: "var(--bg-card)", height: "72px", border: "1px solid var(--border)" }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-10 rounded-2xl text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          
          <p className="text-sm text-slate-100 font-medium mb-1" style={{ color: "#f1f5f9" }}>
            {searchQuery ? "No patients match your search" : "No patients yet"}
          </p>
          <p className="text-xs mb-4" style={{ color: "#64748b" }}>
            {!searchQuery && "Patients will appear here after you add medical records"}
          </p>
        </motion.div>
      )}

      {/* Patient list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((patient, i) => (
            <motion.div
              key={patient._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              onClick={() => navigate("/doctor/patients/" + patient._id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background    = "var(--bg-hover)";
                e.currentTarget.style.borderColor   = "#10b98140";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background    = "var(--bg-card)";
                e.currentTarget.style.borderColor   = "var(--border)";
              }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
                  style={{ background: "#10b98118", color: "#10b981" }}
                >
                  {patient.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {patient.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{ background: "#3b82f618", color: "#3b82f6" }}
                    >
                      {patient.uniqueId}
                    </span>
                    {patient.phone && (
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {patient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "#3b82f618", color: "#3b82f6", border: "1px solid #3b82f630" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/doctor/add-record", { state: { patient } });
                  }}
                >
                  + Record
                </motion.button>
                <svg
                  width="16" height="16" fill="none" viewBox="0 0 24 24"
                  stroke="#64748b" strokeWidth={2}
                >
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}