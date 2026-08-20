import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";

export default function PendingDoctors() {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const fetchPending = () => {
    api.get("/admin/pending-doctors")
      .then(res => setDoctors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      await api.put(`/admin/approve-doctor/${id}`);
      fetchPending();
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm(t('rejectConfirm'))) return;
    await api.delete(`/admin/user/${id}`);
    fetchPending();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{/* Pending Approvals */}Pending Approvals</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} awaiting approval
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16" style={{ color: '#94a3b8' }}>{t('loading')}</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-4xl mb-4">✅</div>
          <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map((doc) => (
            <div key={doc._id} className="p-5 rounded-2xl flex items-center justify-between animate-slide-up"
              style={{ background: 'var(--bg-card)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>
                  {doc.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{doc.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{doc.email}</div>
                  <div className="text-xs mt-1" style={{ color: '#fbbf24' }}>
                    {doc.specialization || 'Specialization not specified'} · {doc.phone || 'No phone'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleApprove(doc._id)}
                  disabled={approving === doc._id}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: '#10b981', color: 'white', opacity: approving === doc._id ? 0.7 : 1 }}>
                  {approving === doc._id ? t('approving') : t('approve')}
                </button>
                <button
                  onClick={() => handleReject(doc._id)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.22)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}>
                  {t('reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}