import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const goHome = () => {
    if (!user) return navigate("/");
    if (user.role === "admin") return navigate("/admin/dashboard");
    if (user.role === "doctor") return navigate("/doctor/dashboard");
    if (user.role === "patient") return navigate("/patient/dashboard");
    navigate("/");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "#0f1117" }}
    >
      <div className="text-center animate-fade-in max-w-md">

        {/* Glowing 404 */}
        <div className="relative mb-8 inline-block">
          <div
            className="text-[120px] font-bold leading-none select-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "2px #2a2d3e",
            }}
          >
            404
          </div>

          {/* Orange glow layer */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-[120px] font-bold leading-none select-none"
              style={{
                color: "transparent",
                WebkitTextStroke: "2px #f97316",
                opacity: 0.8,
                filter: "blur(8px)",
              }}
            >
              404
            </div>
          </div>

          {/* Red soft fill */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[120px] font-bold leading-none select-none"
              style={{ color: "#ef4444", opacity: 0.08 }}
            >
              404
            </span>
          </div>
        </div>

        {/* Icon Box */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(249,115,22,0.4)",
          }}
        >
          <svg
            width="26"
            height="26"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#ef4444"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-3" style={{ color: "#f1f5f9" }}>
          Page Not Found
        </h1>

        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "#94a3b8" }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Gradient Button */}
        <button
          onClick={goHome}
          className="px-8 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: "linear-gradient(135deg, #ef4444, #f97316)",
            color: "white",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(135deg, #dc2626, #ea580c)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(135deg, #ef4444, #f97316)")
          }
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}