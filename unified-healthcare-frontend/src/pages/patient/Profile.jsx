import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await api.put("/patient/update-profile", { name, phone });
      const updatedUser = { ...user, name: res.data.user.name, phone: res.data.user.phone };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: '#1e2130',
    border: '1px solid #2a2d3e',
    color: '#f1f5f9',
  };

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>My Profile</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Manage your personal information</p>
      </div>

      {/* Avatar Section */}
      <div className="p-6 rounded-2xl mb-6 flex items-center gap-5"
        style={{ background: '#1e2130', border: '1px solid #2a2d3e' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
          style={{ background: '#a855f7', color: 'white' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-lg" style={{ color: '#f1f5f9' }}>{user?.name}</div>
          <div className="text-sm" style={{ color: '#94a3b8' }}>{user?.email}</div>
          <div className="text-xs font-mono mt-1" style={{ color: '#a855f7' }}>{user?.uniqueId}</div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 rounded-2xl" style={{ background: '#1e2130', border: '1px solid #2a2d3e' }}>
        <h2 className="text-sm font-semibold uppercase mb-5" style={{ color: '#94a3b8' }}>
          Edit Information
        </h2>

        {success && (
          <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Profile updated successfully
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#a855f7'}
              onBlur={e => e.target.style.borderColor = '#2a2d3e'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#a855f7'}
              onBlur={e => e.target.style.borderColor = '#2a2d3e'}
            />
          </div>

          {/* Read-only fields */}
          {[
            { label: 'Email', value: user?.email },
            { label: 'Patient ID', value: user?.uniqueId },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#94a3b8' }}>
                {field.label}
              </label>
              <div className="px-4 py-3 rounded-xl text-sm font-mono"
                style={{ background: '#0f1117', color: '#64748b', border: '1px solid #2a2d3e' }}>
                {field.value}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all mt-2"
            style={{ background: '#a855f7', color: 'white', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}