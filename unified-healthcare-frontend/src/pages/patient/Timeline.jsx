import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { CardSkeleton } from "../../components/common/Skeleton";

const typeColors = {
  "system-generated": { color: "#a855f7", label: "Doctor Visit" },
  imported: { color: "#10b981", label: "Imported" },
};

function TimelineCard({ record, index }) {
  const [expanded, setExpanded] = useState(false);
  const type = typeColors[record.recordType] || typeColors["system-generated"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="relative flex items-start gap-4"
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center flex-shrink-0 mt-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.08 + 0.2, type: "spring", stiffness: 300 }}
          className="w-4 h-4 rounded-full border-2 z-10"
          style={{
            background: type.color,
            borderColor: type.color,
            boxShadow: `0 0 12px ${type.color}60`,
          }}
        />
        <div className="w-0.5 flex-1 mt-1" style={{ background: "#2a2d3e", minHeight: "32px" }} />
      </div>

      {/* Card */}
      <div className="flex-1 mb-6 rounded-2xl overflow-hidden"
        style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>

        <div
          className="px-5 py-4 cursor-pointer flex items-center justify-between"
          onClick={() => setExpanded(!expanded)}
          style={{ borderBottom: expanded ? "1px solid #2a2d3e" : "none" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: type.color + "18", color: type.color }}>
              {type.label}
            </span>
            <div>
              <div className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>
                {record.diagnosis}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                {new Date(record.visitDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
                {record.doctor && <span> · Dr. {record.doctor.name}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {record.paymentAmount > 0 && (
              <span className="text-sm font-semibold" style={{ color: "#f59e0b" }}>
                ₹{record.paymentAmount}
              </span>
            )}
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 py-4 space-y-4">
                {/* Doctor Info */}
                {record.doctor ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#252837" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
                      {record.doctor.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
                        Dr. {record.doctor.name}
                      </div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>
                        {record.doctor.specialization || "General"} · {record.doctor.uniqueId}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl" style={{ background: "#252837" }}>
                    <span className="text-xs" style={{ color: "#94a3b8" }}>Self Uploaded Record</span>
                  </div>
                )}

                {/* Medicines */}
                {record.medicines?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase mb-2" style={{ color: "#94a3b8" }}>
                      Prescribed Medicines
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.medicines.map((med, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="text-xs px-3 py-1.5 rounded-full font-medium"
                          style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}
                        >
                          💊 {med}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {record.notes && (
                  <div>
                    <div className="text-xs font-semibold uppercase mb-2" style={{ color: "#94a3b8" }}>
                      Doctor Notes
                    </div>
                    <p className="text-sm p-3 rounded-xl leading-relaxed"
                      style={{ background: "#252837", color: "#f1f5f9" }}>
                      {record.notes}
                    </p>
                  </div>
                )}

                {/* Reports */}
                {record.reports?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase mb-2" style={{ color: "#94a3b8" }}>
                      Reports & Files
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.reports.map((rep, i) => (
                        <a key={i} href={rep.fileUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all"
                          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          {rep.fileName || "View Report"}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Timeline() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/patient/my-records")
      .then((res) => setRecords(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>Medical Timeline</h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Your complete health history · {records.length} record{records.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : records.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 rounded-2xl"
          style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
        >
          <div className="text-5xl mb-4">🏥</div>
          <p className="font-semibold mb-1" style={{ color: "#f1f5f9" }}>No records yet</p>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Your medical history will appear here after doctor visits
          </p>
        </motion.div>
      ) : (
        <div className="relative max-w-2xl">
          {/* Animated vertical line */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-[7px] top-2 w-0.5"
            style={{ background: "linear-gradient(to bottom, #a855f7, #2a2d3e)" }}
          />
          <div className="relative">
            {records.map((record, i) => (
              <TimelineCard key={record._id} record={record} index={i} />
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  );
}