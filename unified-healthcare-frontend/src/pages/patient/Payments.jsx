import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";

export default function Payments() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/patient/payment-history")
      .then((res) => setRecords(res.data?.records || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total    = records.reduce((s, r) => s + (r.paymentAmount || 0), 0);
  const paid     = records.filter((r) => r.paymentAmount > 0);
  const highest  = paid.length > 0 ? Math.max(...paid.map((r) => r.paymentAmount)) : 0;
  const avgSpend = paid.length > 0 ? Math.round(total / paid.length) : 0;

  return (
    <PageTransition>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Payment History</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>All your medical billing records</p>
      </motion.div>

      {/* ── Summary cards ── */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Spent",   value: "₹" + total.toLocaleString("en-IN"), color: "#10b981" },
            { label: "Avg per Visit", value: "₹" + avgSpend.toLocaleString("en-IN"), color: "#3b82f6" },
            { label: "Highest Bill",  value: "₹" + highest.toLocaleString("en-IN"), color: "#f59e0b" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-2xl text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="text-xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: "#64748b" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Records ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#1e2130" }} />
          ))}
        </div>
      ) : records.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 rounded-2xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No payments yet</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Payment records appear after doctor visits</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {records.map((record, i) => (
            <motion.div
              key={record._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-5 rounded-2xl flex items-center justify-between"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.12)" }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={2}>
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {record.diagnosis}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                    {record.doctor ? "Dr. " + record.doctor.name : "Self Upload"}{" "}·{" "}
                    {new Date(record.visitDate || record.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className="text-lg font-bold"
                  style={{ color: record.paymentAmount > 0 ? "#f59e0b" : "#64748b" }}
                >
                  {record.paymentAmount > 0 ? "₹" + record.paymentAmount : "—"}
                </div>
                {record.paymentAmount > 0 && (
                  <div className="text-xs" style={{ color: "#64748b" }}>Paid</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}