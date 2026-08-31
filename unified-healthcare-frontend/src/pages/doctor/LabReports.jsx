import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { downloadFile } from "../../utils/download";

const TODAY = new Date().toISOString().slice(0, 10);

export default function DoctorLabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState("");
  const navigate              = useNavigate();

  // ── Add-report modal ──
  const [showModal, setShowModal]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [pQuery, setPQuery]           = useState("");
  const [pResults, setPResults]       = useState([]);
  const [pSearching, setPSearching]   = useState(false);
  const [patient, setPatient]         = useState(null);
  const [form, setForm]               = useState({ title: "", testDate: "", notes: "", file: null });

  const loadReports = () => {
    setLoading(true);
    api.get("/doctor/lab-reports")
      .then((res) => setReports(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(loadReports, []);

  const filtered = reports.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.patient?.name?.toLowerCase().includes(q) ||
      r.patient?.uniqueId?.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q)
    );
  });

  const resetModal = () => {
    setShowModal(false);
    setPQuery(""); setPResults([]); setPatient(null);
    setForm({ title: "", testDate: "", notes: "", file: null });
  };

  const searchPatients = async (e) => {
    e.preventDefault();
    const q = pQuery.trim();
    if (!q) return;
    setPSearching(true);
    try {
      const res = await api.get(`/doctor/search-patient?query=${encodeURIComponent(q)}`);
      const data = res.data?.patients || res.data || [];
      setPResults(Array.isArray(data) ? data : [data]);
    } catch {
      setPResults([]);
      toast.error("Patient search failed");
    } finally {
      setPSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient?._id) return toast.error("Select a patient first");
    if (!form.file) return toast.error("Choose a report file (JPEG, PNG or PDF)");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", form.file);
      if (form.title.trim()) fd.append("title", form.title.trim());
      if (form.testDate) fd.append("testDate", form.testDate);
      if (form.notes.trim()) fd.append("notes", form.notes.trim());
      await api.post(`/doctor/lab-reports/${patient._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Lab report added");
      resetModal();
      loadReports();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add lab report");
    } finally {
      setSaving(false);
    }
  };

  const modalInput = {
    background: "var(--bg-primary)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <PageTransition>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Lab Reports
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Add a lab / test report for any patient, and view or download reports you have uploaded.
        </p>
      </motion.div>

      {/* Add + filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by patient name, ID or report title..."
          className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
          style={{ background: "#10b981", color: "white" }}
        >
          + Add Lab Report
        </button>
        {!loading && (
          <span
            className="text-xs px-3 py-2 rounded-xl flex-shrink-0"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            {filtered.length} report{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl animate-pulse"
              style={{ background: "var(--bg-card)", height: 76, border: "1px solid var(--border)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="text-4xl mb-3">🧪</div>
          <p className="text-sm font-medium mb-1" style={{ color: "#94a3b8" }}>
            {query ? "No lab reports match your search" : "You haven't uploaded any lab reports yet"}
          </p>
          {!query && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "#10b981", color: "white" }}
            >
              + Add Lab Report
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rep, i) => (
            <motion.div
              key={rep._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start justify-between gap-4 p-4 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}
                >
                  {rep.patient?.name?.[0]?.toUpperCase() || "P"}
                </div>
                <div className="min-w-0">
                  <button
                    className="font-semibold text-sm hover:underline text-left"
                    style={{ color: "var(--text-primary)" }}
                    onClick={() => navigate("/doctor/patients/" + rep.patient?._id)}
                  >
                    {rep.patient?.name || "Unknown Patient"}
                  </button>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{ background: "#3b82f618", color: "#3b82f6" }}>
                      {rep.patient?.uniqueId}
                    </span>
                    <span className="text-xs" style={{ color: "#94a3b8" }}>
                      {rep.title || "Lab Report"}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    {new Date(rep.testDate || rep.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </div>
                  {rep.notes && (
                    <div className="text-xs mt-2 p-2 rounded-lg"
                      style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                      {rep.notes}
                    </div>
                  )}
                </div>
              </div>

              {rep.file?.fileUrl && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a
                    href={rep.file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-2 py-1.5 rounded-lg flex items-center gap-1 justify-center"
                    style={{ background: "#3b82f618", color: "#3b82f6", border: "1px solid #3b82f630" }}
                  >
                    <svg width="12" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                    
                  </a>
                  <button
                    onClick={() => downloadFile(rep.file.fileUrl, rep.file.fileName || (rep.title || "lab-report"))}
                    className="text-xs px-2 py-1.5 rounded-lg flex items-center gap-1 justify-center"
                    style={{ background: "#3b82f618", color: "#3b82f6", border: "1px solid #3b82f630" }}
                  >
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Add Lab Report modal (with patient picker) ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.55)" }}
            onClick={() => !saving && resetModal()}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Add Lab Report
              </h3>

              {/* Step 1 — pick patient */}
              {!patient ? (
                <>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                    Find patient <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <form onSubmit={searchPatients} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={pQuery}
                      onChange={(e) => setPQuery(e.target.value)}
                      placeholder="Name or Patient ID (e.g. PAT0001)"
                      className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                      style={modalInput}
                    />
                    <button
                      type="submit"
                      disabled={pSearching || !pQuery.trim()}
                      className="px-3 py-2 rounded-xl text-sm font-semibold flex-shrink-0"
                      style={{ background: "#3b82f6", color: "white", opacity: pSearching || !pQuery.trim() ? 0.6 : 1 }}
                    >
                      {pSearching ? "…" : "Search"}
                    </button>
                  </form>
                  <div className="space-y-2 mb-1">
                    {pResults.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => { setPatient(p); setPResults([]); }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left"
                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "#10b98118", color: "#10b981" }}>
                          {p.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.uniqueId} · {p.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {pSearching === false && pQuery && pResults.length === 0 && (
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No patient found — try a different name or ID.</p>
                  )}
                </>
              ) : (
                /* Step 2 — report details */
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl mb-4"
                    style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "#10b98118", color: "#10b981" }}>
                        {patient.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{patient.name}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{patient.uniqueId}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setPatient(null)}
                      className="text-xs font-semibold flex-shrink-0" style={{ color: "#3b82f6" }}>
                      Change
                    </button>
                  </div>

                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                    Report title <span style={{ fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    maxLength={150}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Complete Blood Count (CBC)"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
                    style={modalInput}
                  />

                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                    Test date <span style={{ fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={form.testDate}
                    max={TODAY}
                    onChange={(e) => setForm((f) => ({ ...f, testDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
                    style={modalInput}
                  />

                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                    Notes <span style={{ fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    rows={2}
                    maxLength={2000}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Short note about this report"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3 resize-none"
                    style={modalInput}
                  />

                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                    Report file <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                    className="w-full text-xs mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                    JPEG, PNG or PDF · up to 10&nbsp;MB
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={resetModal}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: saving ? "#0d9268" : "#10b981", color: "white", opacity: saving ? 0.85 : 1 }}
                    >
                      {saving ? "Uploading…" : "Add Report"}
                    </button>
                  </div>
                </form>
              )}

              {!patient && (
                <button
                  type="button"
                  onClick={resetModal}
                  className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                >
                  Cancel
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
