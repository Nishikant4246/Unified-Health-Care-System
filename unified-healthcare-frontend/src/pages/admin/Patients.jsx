import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { TableRowSkeleton } from "../../components/common/Skeleton";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      setPatients((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Failed to delete patient");
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>
            Manage Patients
          </h1>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            {patients.length} patients registered
          </p>
        </motion.div>

        <motion.input
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          type="text"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm outline-none w-56"
          style={{
            background: "#1e2130",
            border: "1px solid #2a2d3e",
            color: "#f1f5f9",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.target.style.borderColor = "#2a2d3e")}
        />
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                {["Patient", "ID", "Phone", "Registered", "Action"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#94a3b8" }}
                  >
                    {h}
                  </th>
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
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <div className="text-3xl mb-3">
                      {search ? "🔍" : "👥"}
                    </div>
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
                    style={{
                      borderBottom:
                        i < filtered.length - 1 ? "1px solid #2a2d3e" : "none",
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{
                            background: "rgba(59,130,246,0.15)",
                            color: "#3b82f6",
                          }}
                        >
                          {p.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: "#f1f5f9" }}
                          >
                            {p.name}
                          </div>
                          <div className="text-xs" style={{ color: "#94a3b8" }}>
                            {p.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-5 py-4 font-mono text-xs"
                      style={{ color: "#3b82f6" }}
                    >
                      {p.uniqueId}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>
                      {p.phone || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(p._id, p.name)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(239,68,68,0.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(239,68,68,0.1)")
                        }
                      >
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

      {/* Results count when searching */}
      {search && filtered.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs"
          style={{ color: "#64748b" }}
        >
          Showing {filtered.length} of {patients.length} patients
        </motion.p>
      )}
    </PageTransition>
  );
}