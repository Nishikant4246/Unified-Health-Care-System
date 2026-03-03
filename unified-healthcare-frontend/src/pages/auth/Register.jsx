import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { ...form, role: "patient" });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0f1117' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a2e1f 100%)' }}>
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#10b981' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="white"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">UHCS</span>
          </div>

          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6" style={{ color: '#f1f5f9' }}>
              Join the<br />
              <span style={{ color: '#10b981' }}>Healthcare</span><br />
              Network
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: '#94a3b8' }}>
              Create your patient account and get instant access to your complete medical history.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Free to Join', icon: '🆓' },
            { label: 'Instant Access', icon: '⚡' },
            { label: 'Always Private', icon: '🔐' },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl text-center"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-xs font-medium" style={{ color: '#94a3b8' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Create Account</h2>
            <p style={{ color: '#94a3b8' }}>Register as a patient to get started</p>
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
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
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
                  required={field.key !== 'phone'}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#1e2130', border: '1px solid #2a2d3e', color: '#f1f5f9' }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = '#2a2d3e'}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2"
              style={{ background: loading ? '#0d9268' : '#10b981', color: 'white', opacity: loading ? 0.8 : 1 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link to="/" className="font-semibold" style={{ color: '#10b981' }}>Sign in</Link>
          </p>
          <p className="mt-3 text-center text-sm" style={{ color: '#94a3b8' }}>
            Are you a doctor?{' '}
            <Link to="/register-doctor" className="font-semibold" style={{ color: '#10b981' }}>Apply here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}