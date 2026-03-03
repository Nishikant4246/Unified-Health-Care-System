import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function RegisterDoctor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", specialization: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register-doctor", form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8"
        style={{ background: '#0f1117' }}>
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(251,191,36,0.12)', border: '2px solid rgba(251,191,36,0.3)' }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-3" style={{ color: '#f1f5f9' }}>
            Application Submitted!
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#94a3b8' }}>
            Your doctor registration is pending admin approval. You'll be able to log in once an administrator reviews and approves your application.
          </p>

          <div className="p-4 rounded-xl mb-8"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#fbbf24' }} />
              <span className="text-sm font-medium" style={{ color: '#fbbf24' }}>
                Awaiting Admin Approval
              </span>
            </div>
          </div>

          <Link to="/"
            className="inline-block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all"
            style={{ background: '#10b981', color: 'white' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0f1117' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 100%)' }}>
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#3b82f6' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="white"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">UHCS</span>
          </div>

          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6" style={{ color: '#f1f5f9' }}>
              Join as a<br />
              <span style={{ color: '#3b82f6' }}>Doctor</span><br />
              Today
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: '#94a3b8' }}>
              Apply to become a verified doctor on UHCS. Your application will be reviewed by an administrator before approval.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            { step: '1', label: 'Fill in your details', desc: 'Name, email, specialization' },
            { step: '2', label: 'Admin reviews application', desc: 'Usually within 24 hours' },
            { step: '3', label: 'Get approved & login', desc: 'Full access to doctor portal' },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: '#3b82f6', color: 'white' }}>
                {item.step}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>{item.label}</div>
                <div className="text-xs" style={{ color: '#94a3b8' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Doctor Application</h2>
            <p style={{ color: '#94a3b8' }}>Fill in your details to apply</p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg width="18" height="18" fill="#ef4444" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. John Smith' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'doctor@hospital.com' },
              { key: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Cardiologist, General Physician' },
              { key: 'phone', label: 'Phone Number', type: 'text', placeholder: '+91 98765 43210' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#1e2130', border: '1px solid #2a2d3e', color: '#f1f5f9' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#2a2d3e'}
                />
              </div>
            ))}

            <div className="p-4 rounded-xl mt-2"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <div className="flex items-start gap-2">
                <svg width="16" height="16" fill="#fbbf24" viewBox="0 0 20 20" className="flex-shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: '#fbbf24' }}>
                  Your account will be inactive until approved by an administrator. You will not be able to login until approved.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ background: loading ? '#1d4ed8' : '#3b82f6', color: 'white', opacity: loading ? 0.8 : 1 }}
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#94a3b8' }}>
            Already approved?{' '}
            <Link to="/" className="font-semibold" style={{ color: '#3b82f6' }}>Sign in here</Link>
          </p>
          <p className="mt-3 text-center text-sm" style={{ color: '#94a3b8' }}>
            Registering as a patient?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#10b981' }}>Patient signup</Link>
          </p>
        </div>
      </div>
    </div>
  );
}