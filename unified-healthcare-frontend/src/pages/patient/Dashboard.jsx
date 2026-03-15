import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function PatientDashboard() {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="text-center mt-20" style={{ color: "#f1f5f9" }}>
        Loading...
      </div>
    );
  }

  const actions = [
    {
      label: "Medical Timeline",
      desc: "View your complete health history",
      path: "/patient/timeline",
      color: "#a855f7",
    },
    {
      label: "Upload Old Report",
      desc: "Import past medical documents",
      path: "/patient/upload-report",
      color: "#10b981",
    },
    {
      label: "Payment History",
      desc: "View all your medical bills",
      path: "/patient/payments",
      color: "#f59e0b",
    },
    {
      label: "My Profile",
      desc: "Update your personal details",
      path: "/patient/profile",
      color: "#3b82f6",
    },
  ];

  return (
    <div className="animate-fade-in">

      {/* Welcome Banner */}
      <div
        className="mb-8 p-6 rounded-2xl relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e2130 0%, #2a1f3d 100%)",
          border: "1px solid rgba(168,85,247,0.2)",
        }}
      >

        <div className="relative z-10 flex items-center gap-4">

          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{ background: "#a855f7", color: "white" }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>

          <div>
            <p className="text-sm mb-1" style={{ color: "#94a3b8" }}>
              Welcome back,
            </p>

            <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>
              {user.name}
            </h1>

            <p
              className="text-xs font-mono mt-1"
              style={{ color: "#a855f7" }}
            >
              {user.uniqueId}
            </p>

          </div>

        </div>
      </div>

      {/* Action Cards */}

      <h2 className="text-lg font-semibold mb-4" style={{ color: "#f1f5f9" }}>
        Your Health Portal
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {actions.map((action) => (

          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="p-6 rounded-2xl text-left transition-all"
            style={{
              background: "#1e2130",
              border: "1px solid #2a2d3e",
              cursor: "pointer",
            }}
          >

            <div
              className="font-semibold mb-1"
              style={{ color: "#f1f5f9" }}
            >
              {action.label}
            </div>

            <div
              className="text-sm"
              style={{ color: "#94a3b8" }}
            >
              {action.desc}
            </div>

          </button>

        ))}

      </div>

    </div>
  );
}