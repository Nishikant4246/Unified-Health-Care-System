import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AddRecord() {
  const location = useLocation();
  const navigate = useNavigate();
  const preloaded = location.state?.patient || null;

  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState(preloaded);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [form, setForm] = useState({
    diagnosis: "",
    medicines: "",
    notes: "",
    paymentAmount: "",
    visitDate: new Date().toISOString().split("T")[0],
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = {
    background: '#1e2130',
    border: '1px solid #2a2d3e',
    color: '#f1f5f9',
  };

  const searchPatient = async () => {
    if (!patientId.trim()) return;
    setSearching(true);
    setSearchError("");
    setPatient(null);
    try {
      const res = await api.get("/doctor/search-patient/" + patientId.trim());
      console.log("Search result:", res.data);
      setPatient(res.data);
    } catch (err) {
      setSearchError("Patient not found. Check the ID and try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient) return;
    setError("");
    setSubmitting(true);

    try {
      const pid = patient._id || patient.id;

      console.log("Submitting record:");
      console.log("  patientId:", pid);
      console.log("  diagnosis:", form.diagnosis);
      console.log("  medicines:", form.medicines);
      console.log("  files:", files.length);

      if (!pid) {
        setError("Patient ID missing. Please search again.");
        setSubmitting(false);
        return;
      }

      const data = new FormData();
      data.append("patientId", pid);
      data.append("diagnosis", form.diagnosis);
      data.append("medicines", form.medicines || "");
      data.append("notes", form.notes || "");
      data.append("paymentAmount", form.paymentAmount || 0);
      data.append("visitDate", form.visitDate);
      files.forEach(f => data.append("reports", f));

      await api.post("/doctor/add-record", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => navigate("/doctor/my-records"), 2000);
    } catch (err) {
      console.log("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to add record. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(16,185,129,0.15)' }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#f1f5f9' }}>
          Record Added Successfully
        </h2>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Redirecting to records...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Add Medical Record</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Create a new medical record for a patient</p>
      </div>

      {/* Patient Selection */}
      {!patient ? (
        <div className="p-6 rounded-2xl mb-6"
          style={{ background: '#1e2130', border: '1px solid #2a2d3e' }}>
          <h2 className="text-xs font-semibold uppercase mb-4" style={{ color: '#94a3b8' }}>
            Find Patient
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchPatient()}
              placeholder="Enter Patient ID (e.g. PAT0001)"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none font-mono"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#10b981'}
              onBlur={e => e.target.style.borderColor = '#2a2d3e'}
            />
            <button
              onClick={searchPatient}
              disabled={searching}
              className="px-5 py-3 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
              style={{ background: '#10b981', color: 'white', opacity: searching ? 0.7 : 1 }}
            >
              {searching ? 'Searching...' : 'Find'}
            </button>
          </div>
          {searchError && (
            <p className="mt-3 text-sm" style={{ color: '#ef4444' }}>{searchError}</p>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl mb-6 flex items-center justify-between"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: '#10b981', color: 'white' }}>
              {patient.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#f1f5f9' }}>{patient.name}</div>
              <div className="text-xs font-mono" style={{ color: '#10b981' }}>{patient.uniqueId}</div>
              <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                ID: {patient._id || patient.id}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setPatient(null); setPatientId(""); }}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: '#252837', color: '#94a3b8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#2a2d3e'}
            onMouseLeave={e => e.currentTarget.style.background = '#252837'}
          >
            Change
          </button>
        </div>
      )}

      {/* Record Form */}
      {patient && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">

          {error && (
            <div className="p-4 rounded-xl flex items-start gap-3"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg width="18" height="18" fill="#ef4444" viewBox="0 0 20 20" className="flex-shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
            </div>
          )}

          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
              Diagnosis *
            </label>
            <input
              type="text"
              value={form.diagnosis}
              onChange={e => setForm({ ...form, diagnosis: e.target.value })}
              placeholder="e.g. Hypertension, Diabetes Type 2"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#2a2d3e'}
            />
          </div>

          {/* Medicines */}
          <div>
            <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
              Medicines <span style={{ color: '#64748b' }}>(comma separated)</span>
            </label>
            <input
              type="text"
              value={form.medicines}
              onChange={e => setForm({ ...form, medicines: e.target.value })}
              placeholder="e.g. Amlodipine 5mg, Metformin 500mg"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#2a2d3e'}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional observations, follow-up instructions..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#2a2d3e'}
            />
          </div>

          {/* Date + Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
                Visit Date
              </label>
              <input
                type="date"
                value={form.visitDate}
                onChange={e => setForm({ ...form, visitDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
                Payment (₹)
              </label>
              <input
                type="number"
                value={form.paymentAmount}
                onChange={e => setForm({ ...form, paymentAmount: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
              Upload Reports <span style={{ color: '#64748b' }}>(optional)</span>
            </label>
            <div
              className="relative border-2 border-dashed rounded-xl p-6 text-center transition-all"
              style={{ borderColor: files.length > 0 ? '#10b981' : '#2a2d3e' }}
              onMouseEnter={e => { if (files.length === 0) e.currentTarget.style.borderColor = '#3b82f6'; }}
              onMouseLeave={e => { if (files.length === 0) e.currentTarget.style.borderColor = '#2a2d3e'; }}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setFiles(Array.from(e.target.files))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#94a3b8"
                strokeWidth={1.5} className="mx-auto mb-2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {files.length > 0 ? (
                <div>
                  <p className="text-sm font-medium" style={{ color: '#10b981' }}>
                    {files.length} file{files.length > 1 ? 's' : ''} selected
                  </p>
                  <div className="mt-2 space-y-1">
                    {files.map((f, i) => (
                      <p key={i} className="text-xs" style={{ color: '#64748b' }}>{f.name}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Click to select files
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: submitting ? '#1d4ed8' : '#3b82f6',
              color: 'white',
              opacity: submitting ? 0.8 : 1,
            }}
          >
            {submitting ? 'Saving Record...' : 'Save Medical Record'}
          </button>
        </form>
      )}
    </div>
  );
}