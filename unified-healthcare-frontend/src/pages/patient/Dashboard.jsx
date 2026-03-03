import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Medical Timeline',
      desc: 'View your complete health history',
      path: '/patient/timeline',
      color: '#a855f7',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <line x1="12" y1="2" x2="12" y2="22"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
    },
    {
      label: 'Upload Old Report',
      desc: 'Import past medical documents',
      path: '/patient/upload-report',
      color: '#10b981',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      ),
    },
    {
      label: 'Payment History',
      desc: 'View all your medical bills',
      path: '/patient/payments',
      color: '#f59e0b',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      label: 'My Profile',
      desc: 'Update your personal details',
      path: '/patient/profile',
      color: '#3b82f6',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e2130 0%, #2a1f3d 100%)',
          border: '1px solid rgba(168,85,247,0.2)',
        }}>
        <div className="absolute top-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: '#a855f7', color: 'white' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm mb-1" style={{ color: '#94a3b8' }}>Welcome back,</p>
            <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>{user?.name}</h1>
            <p className="text-xs font-mono mt-1" style={{ color: '#a855f7' }}>{user?.uniqueId}</p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <h2 className="text-lg font-semibold mb-4" style={{ color: '#f1f5f9' }}>Your Health Portal</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, i) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="p-6 rounded-2xl text-left transition-all animate-slide-up"
            style={{
              background: '#1e2130',
              border: '1px solid #2a2d3e',
              cursor: 'pointer',
              animationDelay: i * 60 + 'ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = action.color + '60';
              e.currentTarget.style.background = action.color + '10';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2a2d3e';
              e.currentTarget.style.background = '#1e2130';
            }}
          >
            <div className="p-3 rounded-xl mb-4 inline-block"
              style={{ background: action.color + '18' }}>
              <span style={{ color: action.color }}>{action.icon}</span>
            </div>
            <div className="font-semibold mb-1" style={{ color: '#f1f5f9' }}>{action.label}</div>
            <div className="text-sm" style={{ color: '#94a3b8' }}>{action.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}