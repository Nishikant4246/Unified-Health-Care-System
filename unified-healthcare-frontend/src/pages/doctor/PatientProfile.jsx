import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { useLanguage } from "../../context/LanguageContext";

// ── Small reusable badge ──────────────────────────────────────
function Badge({ children, color = "#10b981" }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: color + "18", color }}
    >
      {children}
    </span>
  );
}

// ── Single timeline card ──────────────────────────────────────
function RecordCard({ record, isYours, index, onAddRecord }) {
  const [open, setOpen] = useState(false);
  const dotColor = isYours ? "#10b981" : "#3b82f6";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06 }}
      className="relative pl-10"
    >
      {/* Timeline dot */}
      <div
        className="absolute left-2.5 top-5 w-3 h-3 rounded-full border-2"
        style={{ background: "var(--bg-primary)", borderColor: dotColor, zIndex: 1 }}
      />

      <div
        className="rounded-2xl overflow-hidden transition-all"
        style={{
          background: "var(--bg-card)",
          border: "1px solid " + (open ? dotColor + "40" : "var(--border)"),
        }}
      >
        {/* Header row */}
        <div
          className="flex items-start justify-between p-4 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {record.diagnosis}
              </span>
              {isYours && <Badge color="#10b981">You</Badge>}
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: "var(--text-secondary)" }}>
              <span>Dr. {record.doctor?.name || "Unknown"}</span>
              <span>·</span>
              <span>
                {new Date(record.visitDate || record.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </span>
              {record.paymentAmount > 0 && (
                <>
                  <span>·</span>
                  <span style={{ color: "#10b981" }}>₹{record.paymentAmount}</span>
                </>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: "var(--text-secondary)", flexShrink: 0 }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 9l-7 7-7-7"/>
            </svg>
          </motion.div>
        </div>

        {/* Expanded body */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="pt-3" />

                {/* Medicines */}
                {record.medicines?.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>
                      💊 Medicines
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.medicines.map((med, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ background: "#a855f718", color: "#a855f7", border: "1px solid #a855f730" }}
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
                    <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--text-secondary)" }}>
                      📝 Notes
                    </div>
                    <div
                      className="text-xs p-3 rounded-xl"
                      style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}
                    >
                      {record.notes}
                    </div>
                  </div>
                )}

                {/* Reports */}
                {record.reports?.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>
                      📁 Reports ({record.reports.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.reports.map((rep, i) => (
                        <a
                          key={i}
                          href={rep?.fileUrl || rep}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                          style={{ background: "#fbbf2418", color: "#fbbf24", border: "1px solid #fbbf2430" }}
                        >
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          {rep?.fileName || `Report ${i + 1}`}
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

// ── Main component ────────────────────────────────────────────
export default function PatientProfile() {
  const { t } = useLanguage();
  const { patientId } = useParams();
  const navigate      = useNavigate();

  const [patient, setPatient]           = useState(null);
  const [records, setRecords]           = useState([]);
  const [treatedBy, setTreatedBy]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeTab, setActiveTab]       = useState("timeline");
  // store current user id to highlight "You" on records & doctor list
  const [currentDoctorId, setCurrentDoctorId] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    // Get logged-in doctor's id from localStorage (same pattern your app uses)
    try {
      const stored = localStorage.getItem("user");
      if (stored) setCurrentDoctorId(JSON.parse(stored)?._id);
    } catch (_) {}

    api.get(`/doctor/patient/${patientId}`)
      .then((res) => {
        setPatient(res.data.patient);
        const recs = res.data.records || [];
        // Sort newest first
        recs.sort((a, b) => new Date(b.visitDate || b.createdAt) - new Date(a.visitDate || a.createdAt));
        setRecords(recs);

        // Build unique doctor list from records
        const map = {};
        recs.forEach((r) => {
          if (r.doctor?._id) map[r.doctor._id] = r.doctor;
        });
        setTreatedBy(Object.values(map));
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load patient profile.");
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl animate-pulse"
            style={{ background: "var(--bg-card)", height: "80px", border: "1px solid var(--border)" }}
          />
        ))}
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="text-center mt-20">
        <p className="text-sm mb-4" style={{ color: "#f87171" }}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  if (!patient) return null;

  const tabs = [
    { key: "timeline", label: "Medical Timeline" },
    { key: "doctors",  label: `Treated By (${treatedBy.length})` },
    { key: "info",     label: "Patient Info" },
  ];

  return (
    <PageTransition>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Back
      </motion.button>

      {/* Patient header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl mb-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Big avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: "#10b98118", color: "#10b981" }}
            >
              {patient.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                {patient.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge color="#3b82f6">{patient.uniqueId}</Badge>
                <Badge color="#a855f7">Patient</Badge>
                {patient.phone && (
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>📞 {patient.phone}</span>
                )}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{patient.email}</div>
            </div>
          </div>

          {/* Add Record CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/doctor/add-record", { state: { patient } })}
            className="px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0"
            style={{ background: "#10b981", color: "white" }}
          >
            + Add Record
          </motion.button>
        </div>

        {/* Quick stats */}
        <div
          className="grid grid-cols-3 gap-4 mt-6 pt-5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {[
            { label: "Total Visits",       value: records.length },
            { label: "Doctors Consulted",  value: treatedBy.length },
            {
              label: "Last Visit",
              value: records.length > 0
                ? new Date(records[0].visitDate || records[0].createdAt)
                    .toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                : "—",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 mb-6"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.key ? "#10b981"  : "var(--bg-card)",
              color:      activeTab === tab.key ? "white"    : "var(--text-secondary)",
              border:     "1px solid " + (activeTab === tab.key ? "#10b981" : "var(--border)"),
              cursor:     "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ── Tab: Medical Timeline ── */}
      {activeTab === "timeline" && (
        <div>
          {records.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-10 rounded-2xl text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                {t('noRecordsForPatient')}
              </p>
              <button
                onClick={() => navigate("/doctor/add-record", { state: { patient } })}
                className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: "#10b981", color: "white" }}
              >
                Add First Record
              </button>
            </motion.div>
          ) : (
            <div className="relative">
              {/* Vertical timeline line */}
              <div
                className="absolute left-5 top-5 bottom-5 w-px"
                style={{ background: "var(--border)" }}
              />
              <div className="space-y-4">
                {records.map((record, i) => (
                  <RecordCard
                    key={record._id}
                    record={record}
                    isYours={record.doctor?._id === currentDoctorId}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Treated By ── */}
      {activeTab === "doctors" && (
        <div className="space-y-3">
          {treatedBy.length === 0 ? (
            <div
              className="p-8 rounded-2xl text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No doctors found</p>
            </div>
          ) : (
            treatedBy.map((doc, i) => {
              const docRecords = records.filter((r) => r.doctor?._id === doc._id);
              const isYou      = doc._id === currentDoctorId;
              return (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold"
                      style={{
                        background: isYou ? "#10b98118" : "#3b82f618",
                        color:      isYou ? "#10b981"   : "#3b82f6",
                      }}
                    >
                      {doc.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        Dr. {doc.name}
                        {isYou && <Badge color="#10b981">You</Badge>}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {doc.specialization || "General"} · {doc.uniqueId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                      {docRecords.length}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Visit{docRecords.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ── Tab: Patient Info ── */}
      {activeTab === "info" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-2xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          {[
            { label: "Full Name",     value: patient.name },
            { label: "Patient ID",    value: patient.uniqueId },
            { label: "Email",         value: patient.email },
            { label: "Phone",         value: patient.phone || "Not provided" },
            { label: "Role",          value: "Patient" },
            {
              label: "Registered On",
              value: new Date(patient.createdAt).toLocaleDateString("en-IN", {
                year: "numeric", month: "long", day: "numeric",
              }),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.value}</span>
            </div>
          ))}
        </motion.div>
      )}
    </PageTransition>
  );
}