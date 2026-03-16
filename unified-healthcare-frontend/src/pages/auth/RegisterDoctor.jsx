import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const inputStyle = {
  background: "#1e2130",
  border: "1px solid #2a2d3e",
  color: "#f1f5f9",
};

const qualifications = ["MBBS", "MD", "MS", "DM", "BDS", "MDS", "BAMS", "BHMS", "DNB", "MCh"];

const specializations = [
  "General Physician", "Cardiologist", "Dermatologist", "Neurologist",
  "Orthopedic", "Pediatrician", "Gynecologist", "ENT Specialist",
  "Ophthalmologist", "Psychiatrist", "Oncologist", "Radiologist",
  "Urologist", "Nephrologist", "Gastroenterologist", "Pulmonologist",
  "Endocrinologist", "Rheumatologist", "General Surgeon", "Anesthesiologist",
];

export default function RegisterDoctor() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Step 1 — Personal
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    // Step 2 — Professional
    specialization: "",
    qualification: "",
    licenseNumber: "",
    experience: "",
    hospital: "",
    consultationFee: "",
    // Step 3 — Education & Bio
    bio: "",
    education: [{ degree: "", institution: "", year: "" }],
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setEducation = (index, key, value) => {
    const updated = [...form.education];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, education: updated }));
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", year: "" }],
    }));
  };

  const removeEducation = (index) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const validateStep = () => {
    setError("");

    if (step === 1) {
      if (form.name.trim().length < 3) { setError("Name must be at least 3 characters"); return false; }
      if (!form.email.includes("@")) { setError("Enter a valid email"); return false; }
      if (!/^[0-9]{10}$/.test(form.phone)) { setError("Phone must be exactly 10 digits"); return false; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters"); return false; }
    }

    if (step === 2) {
      if (!form.specialization) { setError("Please select a specialization"); return false; }
      if (!form.qualification) { setError("Please select your qualification"); return false; }
      if (!form.licenseNumber.trim()) { setError("Medical license number is required"); return false; }
      if (!form.experience || isNaN(form.experience)) { setError("Enter valid years of experience"); return false; }
      if (!form.hospital.trim()) { setError("Hospital / Clinic name is required"); return false; }
    }

    if (step === 3) {
      const validEdu = form.education.filter((e) => e.degree && e.institution && e.year);
      if (validEdu.length === 0) { setError("Add at least one education entry"); return false; }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      const validEducation = form.education.filter((e) => e.degree && e.institution && e.year);
      await api.post("/auth/register-doctor", {
        ...form,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee) || 0,
        education: validEducation,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#0f1117" }}>
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(251,191,36,0.12)", border: "2px solid rgba(251,191,36,0.3)" }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: "#f1f5f9" }}>Application Submitted!</h1>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#94a3b8" }}>
            Your doctor registration has been submitted and is pending admin review. You will be able to login once approved.
          </p>
          <div className="p-4 rounded-xl mb-8"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#fbbf24" }} />
              <span className="text-sm font-medium" style={{ color: "#fbbf24" }}>Awaiting Admin Approval</span>
            </div>
          </div>
          <Link to="/"
            className="inline-block w-full py-3 rounded-xl font-semibold text-sm text-center"
            style={{ background: "#10b981", color: "white" }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Step Indicator ──────────────────────────────────────────
  const steps = ["Personal Info", "Professional", "Education"];

  return (
    <div className="min-h-screen flex" style={{ background: "#0f1117" }}>

      {/* Left Panel */}
      <div className="hidden lg:flex w-2/5 flex-col justify-between p-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f1117 0%, #1a1f2e 100%)" }}>
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#3b82f6" }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="white" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">UHCS</span>
          </div>

          <div>
            <h1 className="text-4xl font-bold leading-tight mb-6" style={{ color: "#f1f5f9" }}>
              Join as a<br />
              <span style={{ color: "#3b82f6" }}>Verified</span><br />
              Doctor
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "#94a3b8" }}>
              Complete your professional profile to apply. All credentials are verified by our admin team before approval.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-4 p-4 rounded-xl transition-all"
              style={{
                background: step === i + 1 ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.05)",
                border: `1px solid ${step === i + 1 ? "rgba(59,130,246,0.4)" : "rgba(59,130,246,0.1)"}`,
              }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: step > i + 1 ? "#10b981" : step === i + 1 ? "#3b82f6" : "#2a2d3e",
                  color: "white",
                }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <div>
                <div className="text-sm font-semibold"
                  style={{ color: step === i + 1 ? "#f1f5f9" : "#64748b" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in">

          {/* Mobile Step Indicator */}
          <div className="flex gap-2 mb-8 lg:hidden">
            {steps.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all"
                style={{ background: step > i ? "#3b82f6" : "#2a2d3e" }} />
            ))}
          </div>

          <div className="mb-8">
            <p className="text-xs font-medium mb-1" style={{ color: "#3b82f6" }}>
              Step {step} of {steps.length}
            </p>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>{steps[step - 1]}</h2>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              {step === 1 && "Your basic personal information"}
              {step === 2 && "Your medical credentials and current practice"}
              {step === 3 && "Your education background and about yourself"}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <svg width="16" height="16" fill="#ef4444" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm" style={{ color: "#ef4444" }}>{error}</span>
            </div>
          )}

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              {[
                { key: "name", label: "Full Name", type: "text", placeholder: "Dr. Rohit Sharma" },
                { key: "email", label: "Email Address", type: "email", placeholder: "doctor@hospital.com" },
                { key: "phone", label: "Phone Number", type: "tel", placeholder: "9876543210" },
                { key: "password", label: "Password", type: "password", placeholder: "Min 6 characters" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (field.key === "phone") value = value.replace(/\D/g, "").slice(0, 10);
                      set(field.key, value);
                    }}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* ── STEP 2: Professional ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Specialization</label>
                <select
                  value={form.specialization}
                  onChange={(e) => set("specialization", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">Select specialization</option>
                  {specializations.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Highest Qualification</label>
                <select
                  value={form.qualification}
                  onChange={(e) => set("qualification", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">Select qualification</option>
                  {qualifications.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                  Medical License Number
                  <span className="ml-1 text-xs" style={{ color: "#64748b" }}>(MCI / State Council Registration)</span>
                </label>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(e) => set("licenseNumber", e.target.value.toUpperCase())}
                  placeholder="e.g. MH-2019-12345"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none font-mono"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.consultationFee}
                    onChange={(e) => set("consultationFee", e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Hospital / Clinic Name</label>
                <input
                  type="text"
                  value={form.hospital}
                  onChange={(e) => set("hospital", e.target.value)}
                  placeholder="e.g. City General Hospital, Pune"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Education & Bio ── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Education Entries */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium" style={{ color: "#94a3b8" }}>Education</label>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    + Add More
                  </button>
                </div>

                <div className="space-y-3">
                  {form.education.map((edu, idx) => (
                    <div key={idx} className="p-4 rounded-xl relative"
                      style={{ background: "#252837", border: "1px solid #2a2d3e" }}>
                      {form.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducation(idx)}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                          ✕
                        </button>
                      )}
                      <div className="grid grid-cols-1 gap-3">
                        <input
                          type="text"
                          placeholder="Degree (e.g. MBBS, MD)"
                          value={edu.degree}
                          onChange={(e) => setEducation(idx, "degree", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                          onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
                        />
                        <input
                          type="text"
                          placeholder="Institution (e.g. AIIMS Delhi)"
                          value={edu.institution}
                          onChange={(e) => setEducation(idx, "institution", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                          onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
                        />
                        <input
                          type="text"
                          placeholder="Year of Passing (e.g. 2018)"
                          value={edu.year}
                          onChange={(e) => setEducation(idx, "year", e.target.value.replace(/\D/g, "").slice(0, 4))}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                          onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                  Professional Bio
                  <span className="ml-1 text-xs" style={{ color: "#64748b" }}>(optional)</span>
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Briefly describe your expertise, approach, and any notable achievements..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
                />
                <p className="text-xs mt-1 text-right" style={{ color: "#64748b" }}>
                  {form.bio.length}/500
                </p>
              </div>

              {/* Warning Notice */}
              <div className="p-4 rounded-xl"
                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <div className="flex items-start gap-2">
                  <svg width="16" height="16" fill="#fbbf24" viewBox="0 0 20 20" className="flex-shrink-0 mt-0.5">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs leading-relaxed" style={{ color: "#fbbf24" }}>
                    All credentials including license number and education will be verified by the admin before your account is approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-xl text-sm font-medium"
                style={{ background: "#252837", color: "#94a3b8" }}>
                ← Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl font-semibold text-sm"
                style={{ background: "#3b82f6", color: "white" }}>
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm"
                style={{ background: loading ? "#1d4ed8" : "#3b82f6", color: "white", opacity: loading ? 0.8 : 1 }}>
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: "#94a3b8" }}>
            Already approved?{" "}
            <Link to="/" className="font-semibold" style={{ color: "#3b82f6" }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}