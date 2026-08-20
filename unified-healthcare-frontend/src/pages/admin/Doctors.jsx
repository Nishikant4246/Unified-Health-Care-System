import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { TableRowSkeleton } from "../../components/common/Skeleton";
import { useLanguage } from "../../context/LanguageContext";

const qualifications = [
  "MBBS",
  "MD",
  "MS",
  "DM",
  "BDS",
  "MDS",
  "BAMS",
  "BHMS",
  "DNB",
  "MCh",
];

const specializations = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Gynecologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Psychiatrist",
  "Oncologist",
  "Radiologist",
  "Urologist",
  "Nephrologist",
  "Gastroenterologist",
  "Pulmonologist",
  "Endocrinologist",
  "Rheumatologist",
  "General Surgeon",
  "Anesthesiologist",
];

const inputStyle = {
  background: "var(--input-bg)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

export default function AdminDoctors() {
  const { t } = useLanguage();

  // ── Verification Badge (uses t from useLanguage) ─────────────────
  function VerificationBadge({ doctor }) {
    if (doctor.status === "suspended") {
      return (
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
          ⊘ {t('suspended')}
        </span>
      );
    }
    if (doctor.verificationMethod === "nmc") {
      return (
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>
          ✦ {t('nmcVerified')}
        </span>
      );
    }
    if (doctor.verificationMethod === "admin") {
      return (
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
          ✓ {t('adminVerified')}
        </span>
      );
    }
    if (doctor.status === "pending") {
      return (
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
          ◌ {t('pending')}
        </span>
      );
    }
    return (
      <span
        className="text-xs px-2 py-1 rounded-full font-medium"
        style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
        ✓ {t('approved')}
      </span>
    );
  }

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    qualification: "",
    licenseNumber: "",
    experience: "",
    hospital: "",
    consultationFee: "",
    bio: "",
    education: [{ degree: "", institution: "", year: "" }],
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // NMC state
  const [nmcResult, setNmcResult] = useState(null);
  const [nmcLoading, setNmcLoading] = useState(false);

  // Suspend modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspending, setSuspending] = useState(false);

  // Search / filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchDoctors = () => {
    setLoading(true);
    api
      .get("/admin/doctors")
      .then((res) => setDoctors(res.data))
      .catch(() => toast.error("Failed to load doctors"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ── Filtered doctors ──────────────────────────────────────
  const filtered = doctors.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.uniqueId?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Handlers ─────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const validEducation = form.education.filter(
        (e) => e.degree && e.institution && e.year,
      );
      await api.post("/admin/create-doctor", {
        ...form,
        experience: Number(form.experience) || 0,
        consultationFee: Number(form.consultationFee) || 0,
        education: validEducation,
      });
      toast.success("Doctor created successfully!");
      setShowForm(false);
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        qualification: "",
        licenseNumber: "",
        experience: "",
        hospital: "",
        consultationFee: "",
        bio: "",
        education: [{ degree: "", institution: "", year: "" }],
      });
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(t('deleteConfirm').replace('{name}', name))) return;
    try {
      await api.delete(`/admin/user/${id}`);
      toast.success("Doctor deleted");
      if (selectedDoctor?._id === id) {
        setSelectedDoctor(null);
        setProfile(null);
      }
      fetchDoctors();
    } catch {
      toast.error("Failed to delete doctor");
    }
  };

  const handleViewProfile = async (doc) => {
    setSelectedDoctor(doc);
    setActiveTab("info");
    setNmcResult(null);
    setProfileLoading(true);
    try {
      const res = await api.get(`/admin/doctor/${doc._id}`);
      setProfile(res.data);
    } catch {
      toast.error("Failed to load doctor profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/approve-doctor/${id}`);
      toast.success("Doctor approved");
      fetchDoctors();
      if (selectedDoctor?._id === id) {
        const updated = {
          ...selectedDoctor,
          status: "approved",
          verificationMethod: "admin",
        };
        setSelectedDoctor(updated);
        setProfile((prev) => ({
          ...prev,
          doctor: {
            ...prev.doctor,
            status: "approved",
            verificationMethod: "admin",
          },
        }));
      }
    } catch {
      toast.error("Failed to approve doctor");
    }
  };

  const handleApproveViaNMC = async (id, nmcEntry) => {
    try {
      await api.put(`/admin/approve-doctor-nmc/${id}`, { nmcData: nmcEntry });
      toast.success("Doctor approved via NMC verification");
      fetchDoctors();
      if (selectedDoctor?._id === id) {
        const updated = {
          ...selectedDoctor,
          status: "approved",
          verificationMethod: "nmc",
          nmcVerified: true,
        };
        setSelectedDoctor(updated);
        setProfile((prev) => ({
          ...prev,
          doctor: {
            ...prev.doctor,
            status: "approved",
            verificationMethod: "nmc",
            nmcVerified: true,
          },
        }));
      }
    } catch {
      toast.error("Failed to approve via NMC");
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    setSuspending(true);
    try {
      await api.put(`/admin/suspend-doctor/${selectedDoctor._id}`, {
        reason: suspendReason,
      });
      toast.success("Doctor suspended");
      setShowSuspendModal(false);
      setSuspendReason("");
      fetchDoctors();
      setSelectedDoctor((prev) => ({ ...prev, status: "suspended" }));
      setProfile((prev) => ({
        ...prev,
        doctor: {
          ...prev.doctor,
          status: "suspended",
          suspendedReason: suspendReason,
        },
      }));
    } catch {
      toast.error("Failed to suspend doctor");
    } finally {
      setSuspending(false);
    }
  };
  // NMC Vefication
 const checkNMC = async (name) => {
  setNmcLoading(true);
  setNmcResult(null);
  try {
    const response = await fetch(
      `https://www.nmc.org.in/MCIRest/open/getPaginatedData?service=getDoctorOrHospitalByName&doctor=${encodeURIComponent(name.trim())}&pageNo=0&pageSize=10`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) {
      setNmcResult({ found: false, reachable: false, results: [] });
      return;
    }
    const data = await response.json();
    const results = data?.content || [];
    setNmcResult({ found: results.length > 0, reachable: true, results });
  } catch {
    setNmcResult({ found: false, reachable: false, results: [] });
  } finally {
    setNmcLoading(false);
  }
};

  const setEducation = (index, key, value) => {
    const updated = [...form.education];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, education: updated }));
  };

  return (
    <PageTransition>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Manage Doctors
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {doctors.length} doctors registered
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search name, ID, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm outline-none w-56"
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#10b981")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#059669", color: "white", border: "1px solid #047857", boxShadow: "0 6px 14px rgba(5,150,105,0.2)" }}>
            + Add Doctor
          </motion.button>
        </div>
      </div>

      {/* ── Create Form ────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6">
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}>
              <h2
                className="text-lg font-semibold mb-5"
                style={{ color: "var(--text-primary)" }}>
                Create New Doctor
              </h2>
              <form onSubmit={handleCreate}>
                {/* Personal */}
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "#64748b" }}>
                  Personal Info
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {[
                    { name: "name", placeholder: "Full Name", type: "text" },
                    { name: "email", placeholder: "Email", type: "email" },
                    {
                      name: "password",
                      placeholder: "Password",
                      type: "password",
                    },
                    {
                      name: "phone",
                      placeholder: "Phone (10 digits)",
                      type: "text",
                    },
                  ].map((field) => (
                    <input
                      key={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={(e) =>
                        setForm({ ...form, [field.name]: e.target.value })
                      }
                      required
                      className="px-4 py-3 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  ))}
                </div>

                {/* Professional */}
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "#64748b" }}>
                  Professional Info
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <select
                    value={form.specialization}
                    onChange={(e) =>
                      setForm({ ...form, specialization: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}>
                    <option value="">Select Specialization</option>
                    {specializations.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <select
                    value={form.qualification}
                    onChange={(e) =>
                      setForm({ ...form, qualification: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}>
                    <option value="">Select Qualification</option>
                    {qualifications.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="License Number (e.g. MH-2019-12345)"
                    value={form.licenseNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        licenseNumber: e.target.value.toUpperCase(),
                      })
                    }
                    className="px-4 py-3 rounded-xl text-sm outline-none font-mono"
                    style={inputStyle}
                  />

                  <input
                    type="text"
                    placeholder="Hospital / Clinic Name"
                    value={form.hospital}
                    onChange={(e) =>
                      setForm({ ...form, hospital: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />

                  <input
                    type="number"
                    placeholder="Years of Experience"
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />

                  <input
                    type="number"
                    placeholder="Consultation Fee (₹)"
                    value={form.consultationFee}
                    onChange={(e) =>
                      setForm({ ...form, consultationFee: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                {/* Education */}
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "#64748b" }}>
                  Education
                </p>
                {form.education.map((edu, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) =>
                        setEducation(idx, "degree", e.target.value)
                      }
                      className="px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) =>
                        setEducation(idx, "institution", e.target.value)
                      }
                      className="px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) =>
                        setEducation(idx, "year", e.target.value)
                      }
                      className="px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      education: [
                        ...p.education,
                        { degree: "", institution: "", year: "" },
                      ],
                    }))
                  }
                  className="text-xs px-3 py-1.5 rounded-lg mb-5"
                  style={{
                    background: "rgba(59,130,246,0.1)",
                    color: "#3b82f6",
                  }}>
                  + Add Education
                </button>

                {/* Bio */}
                <textarea
                  placeholder="Professional Bio (optional)"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4"
                  style={inputStyle}
                />

                <div className="flex gap-3 flex-wrap">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: "#10b981", color: "white" }}>
                    {submitting ? "Creating..." : "Create Doctor"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2 rounded-xl text-sm font-medium"
                    style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div
        className={`flex gap-6 ${selectedDoctor ? "flex-col xl:flex-row" : ""}`}>
        {/* Doctors Table */}
        <div className={selectedDoctor ? "w-full xl:w-1/2" : "w-full"}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {[
                      "Doctor",
                      "ID",
                      "Qualification",
                      "Exp",
                      "Verification",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#94a3b8" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <>
                      <TableRowSkeleton cols={6} />
                      <TableRowSkeleton cols={6} />
                      <TableRowSkeleton cols={6} />
                    </>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <div className="text-3xl mb-2">🩺</div>
                        <p className="text-sm" style={{ color: "#94a3b8" }}>
                          {search || filterStatus !== "all"
                            ? "No doctors match your filter"
                            : "No doctors found"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((doc, i) => (
                      <motion.tr
                        key={doc._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleViewProfile(doc)}
                        className="cursor-pointer"
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? "1px solid var(--border)"
                              : "none",
                          background:
                            selectedDoctor?._id === doc._id
                              ? "rgba(16,185,129,0.06)"
                              : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedDoctor?._id !== doc._id)
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.02)";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedDoctor?._id !== doc._id)
                            e.currentTarget.style.background = "transparent";
                        }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                              style={{
                                background: "rgba(16,185,129,0.15)",
                                color: "#10b981",
                              }}>
                              {doc.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div
                                className="text-sm font-medium truncate"
                                style={{ color: "var(--text-primary)" }}>
                                {doc.name}
                              </div>
                              <div
                                className="text-xs truncate"
                                style={{ color: "#94a3b8" }}>
                                {doc.specialization || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          className="px-5 py-4 font-mono text-xs"
                          style={{ color: "#10b981" }}>
                          {doc.uniqueId}
                        </td>
                        <td
                          className="px-5 py-4 text-sm"
                          style={{ color: "#94a3b8" }}>
                          {doc.qualification || "—"}
                        </td>
                        <td
                          className="px-5 py-4 text-sm"
                          style={{ color: "#94a3b8" }}>
                          {doc.experience ? `${doc.experience}y` : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <VerificationBadge doctor={doc} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(doc);
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg"
                              style={{
                                background: "rgba(16,185,129,0.1)",
                                color: "#10b981",
                              }}>
                              View
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(doc._id, doc.name);
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg"
                              style={{
                                background: "rgba(239,68,68,0.1)",
                                color: "#ef4444",
                              }}>
                              Delete
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {(search || filterStatus !== "all") && filtered.length > 0 && (
            <p className="mt-2 text-xs" style={{ color: "#64748b" }}>
              Showing {filtered.length} of {doctors.length} doctors
            </p>
          )}
        </div>

        {/* ── Doctor Profile Panel ──────────────────────────── */}
        <AnimatePresence>
          {selectedDoctor && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className="w-full xl:w-1/2">
              <div
                className="rounded-2xl overflow-hidden xl:sticky xl:top-0"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                {/* Panel Header */}
                <div
                  className="p-5 relative"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%)",
                    borderBottom: "1px solid var(--border)",
                  }}>
                  <button
                    onClick={() => {
                      setSelectedDoctor(null);
                      setProfile(null);
                      setNmcResult(null);
                    }}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "#94a3b8",
                    }}>
                    ✕
                  </button>

                  <div className="flex items-center gap-4 mb-3 pr-8">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                      style={{
                        background: "rgba(16,185,129,0.2)",
                        color: "#10b981",
                      }}>
                      {selectedDoctor.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2
                        className="text-base font-bold truncate"
                        style={{ color: "var(--text-primary)" }}>
                        {selectedDoctor.name}
                      </h2>
                      <p
                        className="text-sm truncate"
                        style={{ color: "#10b981" }}>
                        {selectedDoctor.qualification &&
                          `${selectedDoctor.qualification} · `}
                        {selectedDoctor.specialization || "General"}
                      </p>
                      <p
                        className="text-xs font-mono mt-0.5"
                        style={{ color: "#64748b" }}>
                        {selectedDoctor.uniqueId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <VerificationBadge doctor={selectedDoctor} />
                    {selectedDoctor.experience > 0 && (
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: "rgba(59,130,246,0.1)",
                          color: "#3b82f6",
                        }}>
                        {selectedDoctor.experience} yrs exp
                      </span>
                    )}
                    {selectedDoctor.consultationFee > 0 && (
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          color: "#f59e0b",
                        }}>
                        ₹{selectedDoctor.consultationFee}
                      </span>
                    )}
                  </div>

                  {/* Suspended reason banner */}
                  {selectedDoctor.status === "suspended" &&
                    profile?.doctor?.suspendedReason && (
                      <div
                        className="mt-3 p-3 rounded-xl text-xs"
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          color: "#ef4444",
                        }}>
                        Reason: {profile.doctor.suspendedReason}
                      </div>
                    )}
                </div>

                {/* Tabs */}
                <div
                  className="flex border-b"
                  style={{ borderColor: "var(--border)" }}>
                  {[
                    { key: "info", label: "Details" },
                    { key: "education", label: "Education" },
                    { key: "patients", label: "Patients" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="flex-1 py-3 text-xs font-semibold transition-colors"
                      style={{
                        color: activeTab === tab.key ? "#10b981" : "#64748b",
                        borderBottom:
                          activeTab === tab.key
                            ? "2px solid #10b981"
                            : "2px solid transparent",
                      }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-5 max-h-[60vh] overflow-y-auto">
                  {profileLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-10 rounded-xl animate-pulse"
                          style={{ background: "var(--bg-hover)" }}
                        />
                      ))}
                    </div>
                  ) : profile ? (
                    <>
                      {/* ── DETAILS TAB ── */}
                      {activeTab === "info" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: "Email", value: profile.doctor.email },
                              {
                                label: "Phone",
                                value: profile.doctor.phone || "Not provided",
                              },
                              {
                                label: "Hospital",
                                value:
                                  profile.doctor.hospital || "Not provided",
                              },
                              {
                                label: "License No.",
                                value:
                                  profile.doctor.licenseNumber ||
                                  "Not provided",
                              },
                              {
                                label: "Experience",
                                value: profile.doctor.experience
                                  ? `${profile.doctor.experience} years`
                                  : "—",
                              },
                              {
                                label: "Consultation Fee",
                                value: profile.doctor.consultationFee
                                  ? `₹${profile.doctor.consultationFee}`
                                  : "Not set",
                              },
                              {
                                label: "Records Created",
                                value: profile.totalRecords,
                              },
                              {
                                label: "Joined",
                                value: new Date(
                                  profile.doctor.createdAt,
                                ).toLocaleDateString("en-IN"),
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="p-3 rounded-xl"
                                style={{ background: "var(--bg-hover)" }}>
                                <div
                                  className="text-xs mb-1"
                                  style={{ color: "#64748b" }}>
                                  {item.label}
                                </div>
                                <div
                                  className="text-sm font-medium truncate"
                                  style={{ color: "var(--text-primary)" }}>
                                  {item.value}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Verification info box */}
                          {profile.doctor.verificationMethod && (
                            <div
                              className="p-3 rounded-xl"
                              style={{
                                background:
                                  profile.doctor.verificationMethod === "nmc"
                                    ? "rgba(59,130,246,0.06)"
                                    : "rgba(16,185,129,0.06)",
                                border: `1px solid ${
                                  profile.doctor.verificationMethod === "nmc"
                                    ? "rgba(59,130,246,0.2)"
                                    : "rgba(16,185,129,0.2)"
                                }`,
                              }}>
                              <div
                                className="text-xs font-semibold mb-1"
                                style={{
                                  color:
                                    profile.doctor.verificationMethod === "nmc"
                                      ? "#3b82f6"
                                      : "#10b981",
                                }}>
                                {profile.doctor.verificationMethod === "nmc"
                                  ? "✦ Verified via NMC Register"
                                  : "✓ Verified by Admin"}
                              </div>
                              {profile.doctor.verifiedAt && (
                                <div
                                  className="text-xs"
                                  style={{ color: "#64748b" }}>
                                  on{" "}
                                  {new Date(
                                    profile.doctor.verifiedAt,
                                  ).toLocaleDateString("en-IN")}
                                  {profile.doctor.adminVerifiedBy?.name &&
                                    ` by ${profile.doctor.adminVerifiedBy.name}`}
                                </div>
                              )}
                            </div>
                          )}

                          {profile.doctor.bio && (
                            <div
                              className="p-4 rounded-xl"
                              style={{ background: "var(--bg-hover)" }}>
                              <div
                                className="text-xs mb-2 font-semibold"
                                style={{ color: "#64748b" }}>
                                Professional Bio
                              </div>
                              <p
                                className="text-sm leading-relaxed"
                                style={{ color: "var(--text-secondary)" }}>
                                {profile.doctor.bio}
                              </p>
                            </div>
                          )}

                          {/* Admin Actions */}
                          <div
                            className="pt-4"
                            style={{ borderTop: "1px solid var(--border)" }}>
                            <p
                              className="text-xs font-semibold uppercase tracking-wider mb-3"
                              style={{ color: "#64748b" }}>
                              Admin Actions
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {selectedDoctor.status === "pending" && (
                                <button
                                  onClick={() =>
                                    handleApprove(selectedDoctor._id)
                                  }
                                  className="text-xs px-4 py-2 rounded-lg font-medium"
                                  style={{
                                    background: "rgba(16,185,129,0.15)",
                                    color: "#10b981",
                                  }}>
                                  ✓ Approve Manually
                                </button>
                              )}
                              {selectedDoctor.status === "approved" && (
                                <button
                                  onClick={() => setShowSuspendModal(true)}
                                  className="text-xs px-4 py-2 rounded-lg font-medium"
                                  style={{
                                    background: "rgba(245,158,11,0.1)",
                                    color: "#f59e0b",
                                  }}>
                                  ⊘ Suspend
                                </button>
                              )}
                              {selectedDoctor.status === "suspended" && (
                                <button
                                  onClick={() =>
                                    handleApprove(selectedDoctor._id)
                                  }
                                  className="text-xs px-4 py-2 rounded-lg font-medium"
                                  style={{
                                    background: "rgba(16,185,129,0.15)",
                                    color: "#10b981",
                                  }}>
                                  ↺ Reinstate
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  handleDelete(
                                    selectedDoctor._id,
                                    selectedDoctor.name,
                                  )
                                }
                                className="text-xs px-4 py-2 rounded-lg font-medium"
                                style={{
                                  background: "rgba(239,68,68,0.1)",
                                  color: "#ef4444",
                                }}>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── EDUCATION TAB ── */}
                      {activeTab === "education" && (
                        <div className="space-y-3">
                          {/* Education entries */}
                          {profile.doctor.education &&
                          profile.doctor.education.length > 0 ? (
                            profile.doctor.education.map((edu, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-xl flex items-start gap-3"
                                style={{
                                  background: "var(--bg-hover)",
                                  border: "1px solid var(--border)",
                                }}>
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                  style={{
                                    background: "rgba(59,130,246,0.15)",
                                    color: "#3b82f6",
                                    fontSize: "18px",
                                  }}>
                                  🎓
                                </div>
                                <div>
                                  <div
                                    className="text-sm font-semibold"
                                    style={{ color: "var(--text-primary)" }}>
                                    {edu.degree}
                                  </div>
                                  <div
                                    className="text-sm"
                                    style={{ color: "#94a3b8" }}>
                                    {edu.institution}
                                  </div>
                                  <div
                                    className="text-xs font-mono mt-1"
                                    style={{ color: "#64748b" }}>
                                    Class of {edu.year}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="text-3xl mb-2">🎓</div>
                              <p
                                className="text-sm"
                                style={{ color: "#64748b" }}>
                                No education records added
                              </p>
                            </div>
                          )}

                          {/* License box */}
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(59,130,246,0.06)",
                              border: "1px solid rgba(59,130,246,0.15)",
                            }}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div
                                  className="text-xs font-semibold mb-1"
                                  style={{ color: "#3b82f6" }}>
                                  License Number
                                </div>
                                <div
                                  className="text-sm font-mono font-medium"
                                  style={{ color: "var(--text-primary)" }}>
                                  {profile.doctor.licenseNumber ||
                                    "Not provided"}
                                </div>
                                <div
                                  className="text-xs mt-0.5"
                                  style={{ color: "#64748b" }}>
                                  MCI / State Medical Council
                                </div>
                              </div>
                              <span
                                className="text-xs px-2 py-1 rounded-full font-medium"
                                style={{
                                  background: profile.doctor.licenseNumber
                                    ? "rgba(16,185,129,0.12)"
                                    : "rgba(239,68,68,0.1)",
                                  color: profile.doctor.licenseNumber
                                    ? "#10b981"
                                    : "#ef4444",
                                }}>
                                {profile.doctor.licenseNumber
                                  ? "Provided"
                                  : "Missing"}
                              </span>
                            </div>
                          </div>

                          {/* NMC Verification */}
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(168,85,247,0.06)",
                              border: "1px solid rgba(168,85,247,0.15)",
                            }}>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div
                                  className="text-xs font-semibold"
                                  style={{ color: "#a855f7" }}>
                                  NMC Register Check
                                </div>
                                <div
                                  className="text-xs mt-0.5"
                                  style={{ color: "#64748b" }}>
                                  National Medical Commission of India
                                </div>
                              </div>
                              <button
                                onClick={() => checkNMC(profile.doctor.name)}
                                disabled={nmcLoading}
                                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity"
                                style={{
                                  background: "rgba(168,85,247,0.15)",
                                  color: "#a855f7",
                                  opacity: nmcLoading ? 0.6 : 1,
                                }}>
                                {nmcLoading ? "Checking..." : "Check NMC"}
                              </button>
                            </div>

                            {/* NMC already verified badge */}
                            {profile.doctor.nmcVerified && !nmcResult && (
                              <div
                                className="flex items-center gap-2 p-2 rounded-lg"
                                style={{ background: "rgba(59,130,246,0.08)" }}>
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: "#3b82f6" }}>
                                  ✦ Previously verified via NMC
                                </span>
                                {profile.doctor.nmcData?.checkedAt && (
                                  <span
                                    className="text-xs"
                                    style={{ color: "#64748b" }}>
                                    ·{" "}
                                    {new Date(
                                      profile.doctor.nmcData.checkedAt,
                                    ).toLocaleDateString("en-IN")}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* NMC Results */}
                            {nmcResult && (
                              <div>
                                {!nmcResult.reachable ? (
                                  // NMC blocked or down — show manual fallback
                                  <div className="space-y-2">
                                    <div
                                      className="text-xs p-3 rounded-lg"
                                      style={{
                                        background: "rgba(245,158,11,0.08)",
                                        color: "#f59e0b",
                                      }}>
                                      ⚠ NMC server did not respond. This can
                                      happen due to browser security
                                      restrictions.
                                    </div>

                                    <a
                                      href="https://www.nmc.org.in/information-desk/for-doctors-to-check-name-in-indian-medical-register/"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center justify-between p-3 rounded-lg text-xs font-medium"
                                      style={{
                                        background: "rgba(59,130,246,0.1)",
                                        color: "#3b82f6",
                                        border:
                                          "1px solid rgba(59,130,246,0.2)",
                                      }}>
                                      <span>
                                        Check manually on NMC website →
                                      </span>
                                      <span className="font-mono">
                                        {profile?.doctor?.licenseNumber ||
                                          "No license provided"}
                                      </span>
                                    </a>
                                  </div>
                                ) : nmcResult.found ? (
                                  // Found in NMC register
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span
                                        className="text-xs px-2 py-1 rounded-full font-medium"
                                        style={{
                                          background: "rgba(16,185,129,0.12)",
                                          color: "#10b981",
                                        }}>
                                        ✓ Found in NMC Register
                                      </span>
                                      <span
                                        className="text-xs"
                                        style={{ color: "#64748b" }}>
                                        {nmcResult.results.length} result
                                        {nmcResult.results.length > 1
                                          ? "s"
                                          : ""}
                                      </span>
                                    </div>

                                    {nmcResult.results
                                      .slice(0, 3)
                                      .map((doc, i) => (
                                        <div
                                          key={i}
                                          className="p-3 rounded-xl"
                                          style={{
                                            background: "var(--bg-hover)",
                                            border: "1px solid var(--border)",
                                          }}>
                                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                            {[
                                              {
                                                label: "Name",
                                                value: doc.doctorName,
                                              },
                                              {
                                                label: "Reg No.",
                                                value: doc.registrationNo,
                                              },
                                              {
                                                label: "Council",
                                                value: doc.stateMedicalCouncil,
                                              },
                                              {
                                                label: "Qualification",
                                                value: doc.qualification,
                                              },
                                            ].map((item) => (
                                              <div key={item.label}>
                                                <div
                                                  style={{ color: "#64748b" }}>
                                                  {item.label}
                                                </div>
                                                <div
                                                  style={{ color: "var(--text-primary)" }}>
                                                  {item.value || "—"}
                                                </div>
                                              </div>
                                            ))}
                                          </div>

                                          {selectedDoctor.status !==
                                            "approved" && (
                                            <button
                                              onClick={() =>
                                                handleApproveViaNMC(
                                                  selectedDoctor._id,
                                                  doc,
                                                )
                                              }
                                              className="w-full text-xs py-2 rounded-lg font-medium"
                                              style={{
                                                background:
                                                  "rgba(59,130,246,0.15)",
                                                color: "#3b82f6",
                                              }}>
                                              ✦ Approve with this NMC record
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  // Not found in NMC — manual fallback
                                  <div className="space-y-2">
                                    <div
                                      className="text-xs p-3 rounded-lg"
                                      style={{
                                        background: "rgba(239,68,68,0.08)",
                                        color: "#ef4444",
                                      }}>
                                      ✗ Not found in NMC Register. Verify
                                      manually before approving.
                                    </div>

                                    <a
                                      href="https://www.nmc.org.in/information-desk/for-doctors-to-check-name-in-indian-medical-register/"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center justify-between p-3 rounded-lg text-xs font-medium"
                                      style={{
                                        background: "rgba(59,130,246,0.1)",
                                        color: "#3b82f6",
                                        border:
                                          "1px solid rgba(59,130,246,0.2)",
                                      }}>
                                      <span>
                                        Check manually on NMC website →
                                      </span>
                                      <span className="font-mono">
                                        {profile?.doctor?.licenseNumber ||
                                          "No license provided"}
                                      </span>
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ── PATIENTS TAB ── */}
                      {activeTab === "patients" && (
                        <div>
                          <p
                            className="text-xs mb-4"
                            style={{ color: "#64748b" }}>
                            {profile.totalRecords} total records · showing last
                            5
                          </p>
                          {profile.recentPatients.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="text-3xl mb-2">👥</div>
                              <p
                                className="text-sm"
                                style={{ color: "#64748b" }}>
                                No patients treated yet
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {profile.recentPatients.map((rec) => (
                                <div
                                  key={rec._id}
                                  className="flex items-center justify-between p-3 rounded-xl"
                                  style={{ background: "var(--bg-hover)" }}>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                      style={{
                                        background: "rgba(59,130,246,0.15)",
                                        color: "#3b82f6",
                                      }}>
                                      {rec.patient?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                      <div
                                        className="text-sm font-medium"
                                        style={{ color: "var(--text-primary)" }}>
                                        {rec.patient?.name}
                                      </div>
                                      <div
                                        className="text-xs font-mono"
                                        style={{ color: "#3b82f6" }}>
                                        {rec.patient?.uniqueId}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div
                                      className="text-xs"
                                      style={{ color: "#94a3b8" }}>
                                      {rec.diagnosis}
                                    </div>
                                    <div
                                      className="text-xs"
                                      style={{ color: "#64748b" }}>
                                      {new Date(
                                        rec.visitDate,
                                      ).toLocaleDateString("en-IN")}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Suspend Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showSuspendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowSuspendModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              onClick={(e) => e.stopPropagation()}>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: "var(--text-primary)" }}>
                Suspend Doctor
              </h3>
              <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
                Suspending{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {selectedDoctor?.name}
                </strong>{" "}
                will immediately block their login access.
              </p>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Reason for suspension (required)..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4"
                style={inputStyle}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSuspend}
                  disabled={suspending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: "#ef4444",
                    color: "white",
                    opacity: suspending ? 0.7 : 1,
                  }}>
                  {suspending ? "Suspending..." : "Confirm Suspend"}
                </button>
                <button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSuspendReason("");
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
