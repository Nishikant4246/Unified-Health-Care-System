import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { TableRowSkeleton } from "../../components/common/Skeleton";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", specialization: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = () => {
    setLoading(true);
    api.get("/admin/doctors")
      .then((res) => setDoctors(res.data))
      .catch(() => toast.error("Failed to load doctors"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/create-doctor", form);
      toast.success("Doctor created successfully!");
      setShowForm(false);
      setForm({ name: "", email: "", password: "", phone: "", specialization: "" });
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete Dr. ${name}?`)) return;
    try {
      await api.delete(`/admin/user/${id}`);
      toast.success("Doctor deleted");
      fetchDoctors();
    } catch {
      toast.error("Failed to delete doctor");
    }
  };

  const inputStyle = { background: "#0f1117", border: "1px solid #2a2d3e", color: "#f1f5f9" };

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>Manage Doctors</h1>
          <p className="text-sm" style={{ color: "#94a3b8" }}>{doctors.length} doctors registered</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "#10b981", color: "white" }}
        >
          + Add Doctor
        </motion.button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-6 rounded-2xl"
              style={{ background: "#1e2130", border: "1px solid rgba(16,185,129,0.3)" }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#f1f5f9" }}>Create New Doctor</h2>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {[
                    { name: "name", placeholder: "Full Name", type: "text" },
                    { name: "email", placeholder: "Email", type: "email" },
                    { name: "password", placeholder: "Password", type: "password" },
                    { name: "phone", placeholder: "Phone", type: "text" },
                  ].map((field) => (
                    <input
                      key={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                      required
                      className="px-4 py-3 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  ))}
                  <input
                    type="text"
                    placeholder="Specialization"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className="px-4 py-3 rounded-xl text-sm outline-none md:col-span-2"
                    style={inputStyle}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting}
                    className="px-5 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: "#10b981", color: "white" }}>
                    {submitting ? "Creating..." : "Create Doctor"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-5 py-2 rounded-xl text-sm font-medium"
                    style={{ background: "#252837", color: "#94a3b8" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                {["Doctor", "ID", "Specialization", "Phone", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#94a3b8" }}>{h}</th>
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
              ) : doctors.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm" style={{ color: "#94a3b8" }}>No doctors found</td></tr>
              ) : (
                doctors.map((doc, i) => (
                  <motion.tr
                    key={doc._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: i < doctors.length - 1 ? "1px solid #2a2d3e" : "none" }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                          {doc.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{doc.name}</div>
                          <div className="text-xs" style={{ color: "#94a3b8" }}>{doc.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs" style={{ color: "#10b981" }}>{doc.uniqueId}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>{doc.specialization || "—"}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>{doc.phone || "—"}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          background: doc.status === "approved" ? "rgba(16,185,129,0.12)" : "rgba(251,191,36,0.12)",
                          color: doc.status === "approved" ? "#10b981" : "#fbbf24",
                        }}>
                        {doc.status || "approved"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(doc._id, doc.name)}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                        Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}