import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function MyRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/doctor/my-records")
      .then(res => setRecords(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>My Records</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>All medical records you have created</p>
      </div>

      {loading ? (
        <div className="text-center py-16" style={{ color: '#94a3b8' }}>Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: '#1e2130', border: '1px solid #2a2d3e' }}>
          <div className="text-4xl mb-4">📋</div>
          <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>No records created yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, i) => (
            <div key={record._id}
              className="p-5 rounded-2xl animate-slide-up"
              style={{
                background: '#1e2130',
                border: '1px solid #2a2d3e',
                animationDelay: i * 50 + 'ms',
              }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                    {record.patient?.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#f1f5f9' }}>
                      {record.patient?.name || 'Unknown Patient'}
                    </div>
                    <div className="text-xs font-mono" style={{ color: '#3b82f6' }}>
                      {record.patient?.uniqueId}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: '#94a3b8' }}>
                    {new Date(record.visitDate).toLocaleDateString('en-IN')}
                  </div>
                  {record.paymentAmount > 0 && (
                    <div className="text-sm font-semibold mt-1" style={{ color: '#10b981' }}>
                      ₹{record.paymentAmount}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl mb-3" style={{ background: '#252837' }}>
                <div className="text-xs mb-1" style={{ color: '#94a3b8' }}>DIAGNOSIS</div>
                <div className="text-sm font-medium" style={{ color: '#f1f5f9' }}>{record.diagnosis}</div>
              </div>

              {record.medicines?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {record.medicines.map((med, j) => (
                    <span key={j} className="text-xs px-2 py-1 rounded-full"
                      style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                      {med}
                    </span>
                  ))}
                </div>
              )}

              {record.notes && (
                <p className="text-xs" style={{ color: '#94a3b8' }}>{record.notes}</p>
              )}

              {record.reports?.length > 0 && (
                <div className="mt-3 pt-3 flex gap-2 flex-wrap" style={{ borderTop: '1px solid #2a2d3e' }}>
                  {record.reports.map((rep, j) => (
                    <a key={j} href={rep.fileUrl} target="_blank" rel="noreferrer"
                      className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {rep.fileName || 'Report ' + (j + 1)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}