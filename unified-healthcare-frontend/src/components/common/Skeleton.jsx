import { motion } from "framer-motion";

const shimmer = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
  },
  transition: {
    duration: 1.8,
    repeat: Infinity,
    ease: "linear",
  },
};

function SkeletonBox({ className = "", style = {} }) {
  return (
    <motion.div
      animate={shimmer.animate}
      transition={shimmer.transition}
      className={`rounded-xl ${className}`}
      style={{
        background: "linear-gradient(90deg, #1e2130 25%, #252837 50%, #1e2130 75%)",
        backgroundSize: "200% 100%",
        ...style,
      }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl" style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>
      <div className="flex items-start justify-between mb-4">
        <SkeletonBox style={{ width: 48, height: 48 }} />
        <SkeletonBox style={{ width: 40, height: 22 }} />
      </div>
      <SkeletonBox style={{ width: 80, height: 36, marginBottom: 8 }} />
      <SkeletonBox style={{ width: 120, height: 16 }} />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <SkeletonBox style={{ height: 16, width: i === 0 ? 140 : 80 }} />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-2xl" style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBox style={{ width: 36, height: 36, borderRadius: "50%" }} />
        <div className="flex-1">
          <SkeletonBox style={{ width: 120, height: 14, marginBottom: 6 }} />
          <SkeletonBox style={{ width: 80, height: 12 }} />
        </div>
      </div>
      <SkeletonBox style={{ height: 14, marginBottom: 8 }} />
      <SkeletonBox style={{ height: 14, width: "70%" }} />
    </div>
  );
}

export default SkeletonBox;