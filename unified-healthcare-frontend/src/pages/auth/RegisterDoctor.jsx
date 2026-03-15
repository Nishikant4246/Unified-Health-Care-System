import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function RegisterDoctor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }

    if (form.specialization.trim().length < 3) {
      setError("Please enter a valid specialization");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#0f1117' }}>
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
            Your doctor registration is pending admin approval.
          </p>

          <Link to="/" className="inline-block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all"
            style={{ background: '#10b981', color: 'white' }}>
            Back to Login
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0f1117' }}>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#f1f5f9' }}>
              Doctor Application
            </h2>
            <p style={{ color: '#94a3b8' }}>
              Fill in your details to apply
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. Rohit Sharma' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'doctor@hospital.com' },
              { key: 'specialization', label: 'Specialization', type: 'text', placeholder: 'Cardiologist' },
              { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '9325934246' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '********' },
            ].map(field => (
              <div key={field.key}>

                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                  {field.label}
                </label>

                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => {

                    let value = e.target.value;

                    if (field.key === "phone") {
                      value = value.replace(/\D/g, "").slice(0, 10);
                    }

                    setForm({ ...form, [field.key]: value });

                  }}
                  placeholder={field.placeholder}
                  required
                  minLength={field.key === "name" ? 3 : field.key === "password" ? 6 : field.key === "specialization" ? 3 : undefined}
                  maxLength={field.key === "phone" ? 10 : undefined}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#1e2130', border: '1px solid #2a2d3e', color: '#f1f5f9' }}
                />

              </div>
            ))}

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
            Already approved? <Link to="/" className="font-semibold" style={{ color: '#3b82f6' }}>Sign in here</Link>
          </p>

        </div>
      </div>

    </div>
  );
}