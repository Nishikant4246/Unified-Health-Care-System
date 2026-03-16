import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { TableRowSkeleton } from "../../components/common/Skeleton";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchPatients = () => {
    setLoading(true);
    api.get("/admin/patients")
      .then((res) => setPatients(res.data))
      .catch(() => toast.error("Failed to load patients"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete patient ${name}?`)) return;
    try {
      await api.delete(`/admin/user/${id}`);
      toast.success("Patient deleted");
      if (selectedPatient?._id === id) { setSelectedPatient(null); setProfile(null); }
      setPatients((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Failed to delete patient");
    }
  };

  const handleViewProfile = async (patient) => {
    setSelectedPatient(patient);
    setProfileLoading(true);
    try {
      const res = await api.get(`/admin/patient/${patient._id}`);
      setProfile(res.data);
    } catch {
      toast.error("Failed to load patient profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.uniqueId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>Manage Patients</h1>
          <p className="text-sm" style={{ color: "#94a3b8" }}>{patients.length} patients registered</p>
        </motion.div>

        <motion.input
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          type="text"
          placeholder="Search by name, ID or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm outline-none w-64"
          style={{ background: "#1e2130", border: "1px solid #2a2d3e", color: "#f1f5f9" }}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
        />
      </div>

      <div className="flex gap-6">
        {/* Patients Table */}
        <div className={`transition-all duration-300 ${selectedPatient ? "w-1/2" : "w-full"}`}>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                    {["Patient", "ID", "Phone", "Registered", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#94a3b8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <>
                      <TableRowSkeleton cols={5} />
                      <TableRowSkeleton cols={5} />
                      <TableRowSkeleton cols={5} />
                    </>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="text-3xl mb-3">{search ? "🔍" : "👥"}</div>
                        <p className="text-sm" style={{ color: "#94a3b8" }}>
                          {search ? `No patients matching "${search}"` : "No patients registered yet"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p, i) => (
                      <motion.tr
                        key={p._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleViewProfile(p)}
                        className="cursor-pointer transition-colors"
                        style={{
                          borderBottom: i < filtered.length - 1 ? "1px solid #2a2d3e" : "none",
                          background: selectedPatient?._id === p._id ? "rgba(59,130,246,0.06)" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedPatient?._id !== p._id)
                            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedPatient?._id !== p._id)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                              style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
                              {p.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{p.name}</div>
                              <div className="text-xs" style={{ color: "#94a3b8" }}>{p.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs" style={{ color: "#3b82f6" }}>{p.uniqueId}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>{p.phone || "—"}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>
                          {new Date(p.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); handleViewProfile(p); }}
                              className="text-xs px-3 py-1.5 rounded-lg"
                              style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                              View
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); handleDelete(p._id, p.name); }}
                              className="text-xs px-3 py-1.5 rounded-lg"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
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

          {search && filtered.length > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-3 text-xs" style={{ color: "#64748b" }}>
              Showing {filtered.length} of {patients.length} patients
            </motion.p>
          )}
        </div>

        {/* Patient Profile Panel */}
        <AnimatePresence>
          {selectedPatient && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className="w-1/2"
            >
              <div className="rounded-2xl overflow-hidden sticky top-0"
                style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>

                {/* Profile Header */}
                <div className="p-6 relative"
                  style={{ background: "linear-gradient(135deg, #1e2130 0%, #1a1f2e 100%)", borderBottom: "1px solid #2a2d3e" }}>
                  <button
                    onClick={() => { setSelectedPatient(null); setProfile(null); }}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                    ✕
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                      style={{ background: "rgba(59,130,246,0.2)", color: "#3b82f6" }}>
                      {selectedPatient.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold" style={{ color: "#f1f5f9" }}>{selectedPatient.name}</h2>
                      <p className="text-xs font-mono mt-1" style={{ color: "#3b82f6" }}>{selectedPatient.uniqueId}</p>
                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{selectedPatient.email}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {profileLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: "#252837" }} />
                      ))}
                    </div>
                  ) : profile ? (
                    <>
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                          { label: "Phone", value: profile.patient.phone || "Not provided" },
                          { label: "Total Records", value: profile.totalRecords },
                          { label: "Registered", value: new Date(profile.patient.createdAt).toLocaleDateString("en-IN") },
                          { label: "Patient ID", value: profile.patient.uniqueId },
                        ].map((item) => (
                          <div key={item.label} className="p-3 rounded-xl" style={{ background: "#252837" }}>
                            <div className="text-xs mb-1" style={{ color: "#64748b" }}>{item.label}</div>
                            <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{item.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Medical Records */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>
                          Medical History ({profile.totalRecords} records)
                        </h3>

                        {profile.records.length === 0 ? (
                          <p className="text-sm" style={{ color: "#64748b" }}>No medical records found</p>
                        ) : (
                          <div className="space-y-3">
                            {profile.records.map((rec) => (
                              <div key={rec._id} className="p-4 rounded-xl"
                                style={{ background: "#252837", border: "1px solid #2a2d3e" }}>
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
                                      {rec.diagnosis}
                                    </div>
                                    {rec.doctor && (
                                      <div className="text-xs mt-0.5" style={{ color: "#10b981" }}>
                                        Dr. {rec.doctor.name} · {rec.doctor.specialization || "General"}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs" style={{ color: "#64748b" }}>
                                      {new Date(rec.visitDate).toLocaleDateString("en-IN")}
                                    </div>
                                    {rec.paymentAmount > 0 && (
                                      <div className="text-xs font-medium mt-0.5" style={{ color: "#f59e0b" }}>
                                        ₹{rec.paymentAmount}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {rec.medicines?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {rec.medicines.map((med, idx) => (
                                      <span key={idx} className="text-xs px-2 py-0.5 rounded-full"
                                        style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
                                        {med}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {rec.notes && (
                                  <p className="text-xs mt-2" style={{ color: "#64748b" }}>{rec.notes}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Admin Actions */}
                      <div className="mt-6 pt-5" style={{ borderTop: "1px solid #2a2d3e" }}>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>Admin Actions</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(selectedPatient._id, selectedPatient.name)}
                            className="text-xs px-4 py-2 rounded-lg font-medium"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                            Delete Patient
                          </button>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}