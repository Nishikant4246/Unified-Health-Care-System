import { useId } from "react";

/**
 * UHCS brand mark — a medical shield (secure health data) with a centred
 * cross and a faint vitals pulse, finished with a thin gold rim to match
 * the sidebar / email identity.
 *
 * Renders as a fragment (mark + optional wordmark) so it drops straight
 * into the existing flex logo row in each layout.
 *
 * Props:
 *   subtitle      – small gold label under "UHCS" (e.g. t('adminPanel'))
 *   collapsed     – hide the wordmark (collapsed sidebar shows only the mark)
 *   size          – mark width in px (default 32)
 *   wordmarkSize  – "UHCS" font size in px (default 14)
 *   subtitleSize  – subtitle font size in px (default 11)
 */
export default function Logo({
  subtitle,
  collapsed = false,
  size = 32,
  wordmarkSize = 14,
  subtitleSize = 11,
}) {
  const gid = useId();
  const shield =
    "M12 1.6c-.32 0-.63.06-.92.18L4.05 4.62C3.42 4.88 3 5.5 3 6.18v6.4c0 5.52 3.64 9.47 8.36 11.63.41.19.87.19 1.28 0C17.36 22.05 21 18.1 21 12.58v-6.4c0-.68-.42-1.3-1.05-1.56l-7.03-2.84c-.29-.12-.6-.18-.92-.18Z";

  return (
    <>
      <span
        role="img"
        aria-label="UHCS"
        style={{
          display: "inline-flex",
          flexShrink: 0,
          filter: "drop-shadow(0 3px 7px rgba(16,185,129,0.3))",
        }}
      >
        <svg
          width={size}
          height={Math.round((size * 26) / 24)}
          viewBox="0 0 24 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id={gid}
              x1="4"
              y1="2"
              x2="20"
              y2="24"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#34d399" />
              <stop offset="0.5" stopColor="#10b981" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
          </defs>

          {/* Shield body */}
          <path d={shield} fill={`url(#${gid})`} />

          {/* Vitals pulse (faint) */}
          <polyline
            points="5.4,19.3 9.2,19.3 10.8,16.4 12.8,21.4 14.3,19.3 18.4,19.3"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.4"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Medical cross */}
          <rect x="10.15" y="5.6" width="3.7" height="11.8" rx="1.15" fill="#ffffff" />
          <rect x="6.6" y="9.65" width="10.8" height="3.7" rx="1.15" fill="#ffffff" />

          {/* Gold rim */}
          <path
            d={shield}
            fill="none"
            stroke="#C9A84C"
            strokeOpacity="0.5"
            strokeWidth="0.9"
          />
        </svg>
      </span>

      {!collapsed && (
        <div>
          <div
            style={{
              fontSize: wordmarkSize,
              fontWeight: 800,
              letterSpacing: "0.03em",
              color: "var(--text-primary)",
            }}
          >
            UHCS
          </div>
          {subtitle && (
            <div style={{ fontSize: subtitleSize, fontWeight: 600, color: "#C9A84C" }}>
              {subtitle}
            </div>
          )}
        </div>
      )}
    </>
  );
}
