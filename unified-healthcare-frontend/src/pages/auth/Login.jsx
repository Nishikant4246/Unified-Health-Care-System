import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0f1117' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a2e1f 100%)' }}>
        
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#10b981' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.3"/>
                <path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="white"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">UHCS</span>
          </div>

          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6" style={{ color: '#f1f5f9' }}>
              N's <br/> Unified <br />
              <span style={{ color: '#10b981' }}>Healthcare</span><br />
              System
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: '#94a3b8' }}>
              Secure, centralized digital medical records. 
              One platform for admins, doctors, and patients.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Secure Records', icon: '🔒' },
            { label: 'Role Based Access', icon: '👤' },
            { label: 'Cloud Storage', icon: '☁️' },
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
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Welcome back</h2>
            <p style={{ color: '#94a3b8' }}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg width="18" height="18" fill="#ef4444" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: '#1e2130',
                  border: '1px solid #2a2d3e',
                  color: '#f1f5f9',
                }}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = '#2a2d3e'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: '#1e2130',
                  border: '1px solid #2a2d3e',
                  color: '#f1f5f9',
                }}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = '#2a2d3e'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2"
              style={{
                background: loading ? '#0d9268' : '#10b981',
                color: 'white',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: '#94a3b8' }}>
            New patient?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#10b981' }}>
              Create account
            </Link>
          </p>

          <p className="mt-4 text-center text-sm" style={{ color: '#94a3b8' }}>
            Are you a doctor?{' '}
            <Link to="/register-doctor" className="font-semibold" style={{ color: '#10b981' }}>
              Apply here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}