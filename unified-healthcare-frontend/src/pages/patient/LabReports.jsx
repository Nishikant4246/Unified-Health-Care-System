import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { downloadFile } from "../../utils/download";

export default function LabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/patient/lab-reports")
      .then((res) => setReports(res.data || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load lab reports"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Lab Reports
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Test and lab reports uploaded by your doctors. View or download any report below.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm mb-4"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl animate-pulse"
              style={{ background: "var(--bg-card)", height: 72, border: "1px solid var(--border)" }} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-2xl text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">🧪</div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            You don&rsquo;t have any lab reports yet. When a doctor uploads one, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((rep, i) => (
            <motion.div
              key={rep._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start justify-between gap-4 p-4 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  {rep.title || "Lab Report"}
                </div>
                <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: "var(--text-secondary)" }}>
                  <span>
                    {new Date(rep.testDate || rep.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span>Dr. {rep.doctor?.name || "Unknown"}</span>
                  {rep.doctor?.specialization && (
                    <>
                      <span>·</span>
                      <span>{rep.doctor.specialization}</span>
                    </>
                  )}
                </div>
                {rep.notes && (
                  <div className="text-xs mt-2 p-2 rounded-lg"
                    style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                    {rep.notes}
                  </div>
                )}
              </div>
              {rep.file?.fileUrl && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a
                    href={rep.file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 justify-center"
                    style={{ background: "#3b82f618", color: "#3b82f6", border: "1px solid #3b82f630" }}
                  >
                    <svg width="12" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </a>
                  <button
                    onClick={() => downloadFile(rep.file.fileUrl, rep.file.fileName || (rep.title || "lab-report"))}
                    className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 justify-center"
                    style={{ background: "#a855f718", color: "#a855f7", border: "1px solid #a855f730" }}
                  >
                    <svg width="12" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
