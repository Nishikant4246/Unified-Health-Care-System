import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SearchPatient() {

  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setError("");
    setPatients([]);
    setLoading(true);

    try {

      const res = await api.get(`/doctor/search-patient?query=${query.trim()}`);

      setPatients(res.data);

    } catch (err) {

      setError(err.response?.data?.message || "Patient not found");

    } finally {

      setLoading(false);

    }
  };

  const inputStyle = {
    background: "#1e2130",
    border: "1px solid #2a2d3e",
    color: "#f1f5f9",
  };

  return (
    <div className="animate-fade-in max-w-3xl">

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>
          Search Patient
        </h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Search using Patient ID, Name or Email
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="PAT0001 / Rahul / patient@email.com"
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl text-sm font-semibold"
          style={{ background: "#10b981", color: "white" }}
        >
          {loading ? "Searching..." : "Search"}
        </button>

      </form>

      {error && (
        <div className="text-sm mb-4" style={{ color: "#ef4444" }}>
          {error}
        </div>
      )}

      {patients.length > 0 && (

        <div className="space-y-4">

          {patients.map((patient) => (

            <div
              key={patient._id}
              className="p-6 rounded-2xl"
              style={{
                background: "#1e2130",
                border: "1px solid rgba(16,185,129,0.3)",
              }}
            >

              <div className="flex justify-between items-center mb-4">

                <div>
                  <h2 className="font-bold text-lg" style={{ color: "#f1f5f9" }}>
                    {patient.name}
                  </h2>

                  <p className="text-xs font-mono" style={{ color: "#10b981" }}>
                    {patient.uniqueId}
                  </p>

                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    {patient.email}
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate("/doctor/add-record", { state: { patient } })
                  }
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "#10b981", color: "white" }}
                >
                  Add Record
                </button>

              </div>

            </div>

          ))}

        </div>

      )}
    </div>
  );
}