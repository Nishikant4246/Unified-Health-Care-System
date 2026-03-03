import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Payments() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/patient/payment-history")
      .then(res => setRecords(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = records.reduce((sum, r) => sum + (r.paymentAmount || 0), 0);

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Payment History</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>All your medical billing records</p>
      </div>

      {/* Total */}
      {records.length > 0 && (
        <div className="p-5 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #1e2130, #1a2a1a)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="text-xs font-semibold uppercase mb-1" style={{ color: '#94a3b8' }}>Total Spent</div>
          <div className="text-3xl font-bold" style={{ color: '#10b981' }}>₹{total.toLocaleString('en-IN')}</div>
          <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>across {records.length} visits</div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: '#1e2130' }} />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: '#1e2130', border: '1px solid #2a2d3e' }}>
          <div className="text-5xl mb-4">💳</div>
          <p className="font-semibold mb-1" style={{ color: '#f1f5f9' }}>No payments yet</p>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Payment records will appear after doctor visits</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, i) => (
            <div key={record._id}
              className="p-5 rounded-2xl flex items-center justify-between animate-slide-up"
              style={{
                background: '#1e2130',
                border: '1px solid #2a2d3e',
                animationDelay: i * 50 + 'ms',
              }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.12)' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={2}>
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#f1f5f9' }}>{record.diagnosis}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                    {record.doctor ? 'Dr. ' + record.doctor.name : 'Self Upload'} ·{' '}
                    {new Date(record.visitDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold" style={{ color: '#f59e0b' }}>
                ₹{record.paymentAmount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}