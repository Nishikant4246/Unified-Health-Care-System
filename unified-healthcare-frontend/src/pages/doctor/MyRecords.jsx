import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";

export default function MyRecords() {
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded]       = useState(null);
  const navigate                      = useNavigate();

  useEffect(() => {
    api.get("/doctor/my-records")
      .then((res) => setRecords(res.data?.records || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.patient?.name?.toLowerCase().includes(q)    ||
      r.patient?.uniqueId?.toLowerCase().includes(q)||
      r.diagnosis?.toLowerCase().includes(q)
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
          My Records
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          All medical records created by you
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
            placeholder="Filter by patient name, ID or diagnosis..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        {!loading && (
          <span
            className="text-xs px-3 py-2 rounded-xl flex-shrink-0"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </motion.div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse"
              style={{ background: "var(--bg-card)", height: "88px", border: "1px solid var(--border)" }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="text-4xl mb-4">📋</div>
          <p className="text-sm font-medium mb-1" style={{ color: "#94a3b8" }}>
            {searchQuery ? "No records match your search" : "No records created yet"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate("/doctor/search-patient")}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "#10b981", color: "white" }}
            >
              Search a Patient
            </button>
          )}
        </motion.div>
      )}

      {/* Records list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((record, i) => (
            <motion.div
              key={record._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--bg-card)",
                border: "1px solid " + (expanded === record._id ? "#3b82f640" : "#2a2d3e"),
              }}
            >
              {/* Row header — always visible */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer"
                onClick={() => setExpanded(expanded === record._id ? null : record._id)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}
                  >
                    {record.patient?.name?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div>
                    {/* Patient name — clickable to profile */}
                    <button
                      className="font-semibold text-sm hover:underline text-left"
                      style={{ color: "var(--text-primary)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/doctor/patients/" + record.patient?._id);
                      }}
                    >
                      {record.patient?.name || "Unknown Patient"}
                    </button>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ background: "#3b82f618", color: "#3b82f6" }}
                      >
                        {record.patient?.uniqueId}
                      </span>
                      <span className="text-xs" style={{ color: "#94a3b8" }}>
                        {record.diagnosis}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs" style={{ color: "#94a3b8" }}>
                      {new Date(record.visitDate || record.createdAt).toLocaleDateString("en-IN")}
                    </div>
                    {record.paymentAmount > 0 && (
                      <div className="text-sm font-semibold" style={{ color: "#10b981" }}>
                        ₹{record.paymentAmount}
                      </div>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: expanded === record._id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: "#64748b" }}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M19 9l-7 7-7-7"/>
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expanded === record._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      className="px-5 pb-5 space-y-4"
                      style={{ borderTop: "1px solid #2a2d3e" }}
                    >
                      <div className="pt-4" />

                      {/* Diagnosis block */}
                      <div
                        className="p-3 rounded-xl"
                        style={{ background: "var(--bg-hover)" }}
                      >
                        <div className="text-xs mb-1 uppercase tracking-wide" style={{ color: "#64748b" }}>
                          Diagnosis
                        </div>
                        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {record.diagnosis}
                        </div>
                      </div>

                      {/* Medicines */}
                      {record.medicines?.length > 0 && (
                        <div>
                          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "#64748b" }}>
                            💊 Medicines
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {record.medicines.map((med, j) => (
                              <span
                                key={j}
                                className="text-xs px-2 py-1 rounded-full"
                                style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}
                              >
                                {med}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div>
                          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "#64748b" }}>
                            📝 Notes
                          </div>
                          <p className="text-sm" style={{ color: "#94a3b8" }}>{record.notes}</p>
                        </div>
                      )}

                      {/* Reports */}
                      {record.reports?.length > 0 && (
                        <div>
                          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "#64748b" }}>
                            📁 Reports ({record.reports.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {record.reports.map((rep, j) => (
                              <a
                                key={j}
                                href={rep?.fileUrl || rep}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
                              >
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                  <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                {rep?.fileName || `Report ${j + 1}`}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer actions */}
                      <div
                        className="flex items-center justify-between pt-3"
                        style={{ borderTop: "1px solid #2a2d3e" }}
                      >
                        <button
                          onClick={() => navigate("/doctor/patients/" + record.patient?._id)}
                          className="text-xs"
                          style={{ color: "#3b82f6" }}
                        >
                          View full patient profile →
                        </button>
                        <button
                          onClick={() =>
                            navigate("/doctor/add-record", { state: { patient: record.patient } })
                          }
                          className="text-xs px-3 py-1.5 rounded-lg"
                          style={{ background: "#10b981", color: "white" }}
                        >
                          + New Record
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}