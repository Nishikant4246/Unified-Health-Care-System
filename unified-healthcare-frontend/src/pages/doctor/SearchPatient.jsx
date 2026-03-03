import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SearchPatient() {
  const [query, setQuery] = useState("");
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setPatient(null);
    setLoading(true);
    try {
      const res = await api.get("/doctor/search-patient/" + query.trim());
      setPatient(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Patient not found");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: '#1e2130',
    border: '1px solid #2a2d3e',
    color: '#f1f5f9',
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Search Patient</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Enter patient unique ID to find their profile</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter Patient ID (e.g. PAT0001)"
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none font-mono"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#10b981'}
          onBlur={e => e.target.style.borderColor = '#2a2d3e'}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
          style={{ background: '#10b981', color: 'white', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl mb-4 flex items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <svg width="18" height="18" fill="#ef4444" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
        </div>
      )}

      {patient && (
        <div className="p-6 rounded-2xl animate-slide-up"
          style={{ background: '#1e2130', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                {patient.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#f1f5f9' }}>{patient.name}</h2>
                <p className="text-xs font-mono" style={{ color: '#10b981' }}>{patient.uniqueId}</p>
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{patient.email}</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              Patient Found
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Phone', value: patient.phone || 'Not provided' },
              { label: 'Registered', value: new Date(patient.createdAt).toLocaleDateString('en-IN') },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: '#252837' }}>
                <div className="text-xs mb-1" style={{ color: '#94a3b8' }}>{item.label}</div>
                <div className="text-sm font-medium" style={{ color: '#f1f5f9' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/doctor/add-record', { state: { patient } })}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#10b981', color: 'white' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0d9268'}
            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
          >
            + Add Medical Record for this Patient
          </button>
        </div>
      )}
    </div>
  );
}