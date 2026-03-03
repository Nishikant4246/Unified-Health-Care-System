import { useState } from "react";
import api from "../../api/axios";

export default function UploadReport() {
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return setError("Please select at least one file");
    setError("");
    setSubmitting(true);

    try {
      const data = new FormData();
      files.forEach(f => data.append("reports", f));
      if (notes) data.append("notes", notes);
      if (visitDate) data.append("visitDate", visitDate);

      await api.post("/patient/upload-report", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: '#1e2130',
    border: '1px solid #2a2d3e',
    color: '#f1f5f9',
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
        <h2 className="text-xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Report Uploaded!</h2>
        <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>Your report has been saved to your timeline</p>
        <button
          onClick={() => { setSuccess(false); setFiles([]); setNotes(""); setVisitDate(""); }}
          className="px-5 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#10b981', color: 'white' }}>
          Upload Another
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Upload Old Report</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Import past medical documents to your timeline</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* File Drop Zone */}
        <div>
          <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
            Select Files *
          </label>
          <div className="relative border-2 border-dashed rounded-2xl p-10 text-center transition-all"
            style={{ borderColor: files.length > 0 ? '#10b981' : '#2a2d3e' }}
            onMouseEnter={e => { if (files.length === 0) e.currentTarget.style.borderColor = '#a855f7'; }}
            onMouseLeave={e => { if (files.length === 0) e.currentTarget.style.borderColor = '#2a2d3e'; }}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => setFiles(Array.from(e.target.files))}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {files.length > 0 ? (
              <div>
                <div className="text-3xl mb-3">✅</div>
                <p className="font-semibold text-sm" style={{ color: '#10b981' }}>
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </p>
                <div className="mt-3 space-y-1">
                  {files.map((f, i) => (
                    <p key={i} className="text-xs" style={{ color: '#94a3b8' }}>{f.name}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#94a3b8"
                  strokeWidth={1.5} className="mx-auto mb-3">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                  Click to select files
                </p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                  PDF, JPG, PNG supported
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
            Date of Report (optional)
          </label>
          <input
            type="date"
            value={visitDate}
            onChange={e => setVisitDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Blood test from City Hospital, 2023"
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: '#a855f7', color: 'white', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? 'Uploading...' : 'Upload Report'}
        </button>
      </form>
    </div>
  );
}