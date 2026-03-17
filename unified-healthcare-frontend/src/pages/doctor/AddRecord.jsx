import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";

export default function AddRecord() {
  const location  = useLocation();
  const navigate  = useNavigate();

  // Can be pre-loaded from SearchPatient → navigate with state
  const preloaded = location.state?.patient || null;

  const [patientQuery, setPatientQuery] = useState("");
  const [patient, setPatient]           = useState(preloaded);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]       = useState(false);
  const [searchError, setSearchError]   = useState("");

  const [form, setForm] = useState({
    diagnosis:     "",
    medicines:     "",
    notes:         "",
    paymentAmount: "",
    visitDate:     new Date().toISOString().split("T")[0],
  });
  const [files, setFiles]         = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  const inputStyle = {
    background: "#1e2130",
    border:     "1px solid #2a2d3e",
    color:      "#f1f5f9",
  };

  // ── Search by name OR uniqueId ──────────────────────────────
  const searchPatient = async () => {
    const q = patientQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    setSearchResults([]);
    setPatient(null);
    try {
      // Uses the same query-based endpoint as SearchPatient page
      const res = await api.get(`/doctor/search-patient?query=${encodeURIComponent(q)}`);
      const data = res.data?.patients || res.data || [];
      const list = Array.isArray(data) ? data : [data];
      if (list.length === 0) {
        setSearchError("No patient found. Try a different name or ID.");
      } else if (list.length === 1) {
        // Auto-select if only one result
        setPatient(list[0]);
        setSearchResults([]);
      } else {
        setSearchResults(list);
      }
    } catch (err) {
      setSearchError("Patient not found. Check the name or ID and try again.");
    } finally {
      setSearching(false);
    }
  };

  // ── Submit record ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient) return;
    setError("");
    setSubmitting(true);

    try {
      const pid = patient._id || patient.id;
      if (!pid) {
        setError("Patient ID missing. Please search again.");
        setSubmitting(false);
        return;
      }

      const data = new FormData();
      data.append("patientId",     pid);
      data.append("diagnosis",     form.diagnosis);
      data.append("medicines",     form.medicines || "");
      data.append("notes",         form.notes     || "");
      data.append("paymentAmount", form.paymentAmount || 0);
      data.append("visitDate",     form.visitDate);
      files.forEach((f) => data.append("reports", f));

      await api.post("/doctor/add-record", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => navigate("/doctor/patients/" + pid), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add record.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: "rgba(16,185,129,0.15)" }}
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </motion.div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
          Record Added Successfully
        </h2>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Redirecting to patient profile...
        </p>
      </div>
    );
  }

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>
          Add Medical Record
        </h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Create a new visit record for a patient
        </p>
      </motion.div>

      {/* ── Step 1: Patient selection ── */}
      <AnimatePresence mode="wait">
        {!patient ? (
          <motion.div
            key="search-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-2xl mb-6"
            style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
          >
            <h2 className="text-xs font-semibold uppercase mb-4 tracking-wider" style={{ color: "#94a3b8" }}>
              Step 1 — Find Patient
            </h2>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPatient()}
                placeholder="Enter name or Patient ID (e.g. PAT0001)"
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                onBlur={(e)  => (e.target.style.borderColor = "#2a2d3e")}
              />
              <motion.button
                onClick={searchPatient}
                disabled={searching || !patientQuery.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-3 rounded-xl text-sm font-semibold flex-shrink-0"
                style={{
                  background: searching || !patientQuery.trim() ? "#252837" : "#10b981",
                  color:      searching || !patientQuery.trim() ? "#64748b"  : "white",
                  cursor:     searching || !patientQuery.trim() ? "not-allowed" : "pointer",
                }}
              >
                {searching ? "Searching..." : "Find"}
              </motion.button>
            </div>

            {searchError && (
              <p className="text-sm mt-2" style={{ color: "#f87171" }}>{searchError}</p>
            )}

            {/* Multiple results dropdown */}
            {searchResults.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 space-y-2"
              >
                <p className="text-xs mb-2" style={{ color: "#64748b" }}>
                  {searchResults.length} patients found — select one:
                </p>
                {searchResults.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                    style={{ background: "#252837", border: "1px solid #2a2d3e" }}
                    onClick={() => { setPatient(p); setSearchResults([]); }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#10b98150")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2d3e")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "#10b98118", color: "#10b981" }}
                      >
                        {p.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{p.name}</div>
                        <div className="text-xs font-mono" style={{ color: "#64748b" }}>{p.uniqueId}</div>
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: "#10b981" }}>Select →</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Selected patient chip */
          <motion.div
            key="patient-chip"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between p-4 rounded-xl mb-6"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{ background: "#10b981", color: "white" }}
              >
                {patient.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>
                  {patient.name}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: "#10b981" }}>
                    {patient.uniqueId}
                  </span>
                  {patient.phone && (
                    <span className="text-xs" style={{ color: "#64748b" }}>· {patient.phone}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => { setPatient(null); setPatientQuery(""); setSearchResults([]); }}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "#252837", color: "#94a3b8", border: "1px solid #2a2d3e" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2d3e")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#252837")}
            >
              Change
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 2: Record form (only shows when patient selected) ── */}
      <AnimatePresence>
        {patient && (
          <motion.form
            key="record-form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div
              className="p-5 rounded-2xl space-y-4"
              style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
            >
              <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                Step 2 — Record Details
              </h2>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl flex items-start gap-3"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <svg width="18" height="18" fill="#ef4444" viewBox="0 0 20 20" className="flex-shrink-0 mt-0.5">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm" style={{ color: "#ef4444" }}>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Visit Date */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-2 tracking-wider" style={{ color: "#94a3b8" }}>
                  Visit Date
                </label>
                <input
                  type="date"
                  value={form.visitDate}
                  onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-2 tracking-wider" style={{ color: "#94a3b8" }}>
                  Diagnosis *
                </label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="e.g. Hypertension, Viral fever"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e)  => (e.target.style.borderColor = "#2a2d3e")}
                />
              </div>

              {/* Medicines */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-2 tracking-wider" style={{ color: "#94a3b8" }}>
                  Medicines{" "}
                  <span className="normal-case font-normal" style={{ color: "#64748b" }}>
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.medicines}
                  onChange={(e) => setForm({ ...form, medicines: e.target.value })}
                  placeholder="e.g. Amlodipine 5mg, Metformin 500mg"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e)  => (e.target.style.borderColor = "#2a2d3e")}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-2 tracking-wider" style={{ color: "#94a3b8" }}>
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional observations, follow-up instructions..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e)  => (e.target.style.borderColor = "#2a2d3e")}
                />
              </div>

              {/* Date + Payment row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-2 tracking-wider" style={{ color: "#94a3b8" }}>
                    Payment (₹)
                  </label>
                  <input
                    type="number"
                    value={form.paymentAmount}
                    onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                <div className="flex items-end">
                  <div
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: "#252837", border: "1px solid #2a2d3e" }}
                  >
                    <span className="text-xs" style={{ color: "#64748b" }}>Files selected</span>
                    <div className="font-semibold mt-0.5" style={{ color: "#f1f5f9" }}>
                      {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""}` : "None"}
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-2 tracking-wider" style={{ color: "#94a3b8" }}>
                  Upload Reports{" "}
                  <span className="normal-case font-normal" style={{ color: "#64748b" }}>(optional)</span>
                </label>
                <div
                  className="relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
                  style={{ borderColor: files.length > 0 ? "#10b981" : "#2a2d3e" }}
                  onMouseEnter={(e) => { if (!files.length) e.currentTarget.style.borderColor = "#3b82f6"; }}
                  onMouseLeave={(e) => { if (!files.length) e.currentTarget.style.borderColor = "#2a2d3e"; }}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <svg
                    width="28" height="28" fill="none" viewBox="0 0 24 24"
                    stroke="#94a3b8" strokeWidth={1.5} className="mx-auto mb-2"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {files.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#10b981" }}>
                        {files.length} file{files.length > 1 ? "s" : ""} selected
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1 justify-center">
                        {files.map((f, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "#fbbf2418", color: "#fbbf24" }}
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: "#94a3b8" }}>
                      Click to select PDF / images
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: submitting ? "#1d4ed8" : "#3b82f6",
                color:      "white",
                opacity:    submitting ? 0.8 : 1,
                cursor:     submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Saving Record..." : "Save Medical Record"}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}