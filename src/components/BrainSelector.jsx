import { memoryUrl } from '../lib/api';
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/Card"; // <- Ensure path is correct

const CLUSTERS = [
  { key: "prompt", label: "Prompt", cx: 180, cy: 95, r: 30, color: "#8b5cf6" },
  { key: "dream", label: "Dreams", cx: 120, cy: 145, r: 35, color: "#6366f1" },
  { key: "identity", label: "Trait Evolution", cx: 235, cy: 45, r: 24, color: "#34d399" },
  { key: "trait", label: "Trait Drift", cx: 70, cy: 100, r: 28, color: "#fbbf24" },
  { key: "contradiction", label: "Contradictions", cx: 150, cy: 35, r: 26, color: "#ef4444" },
  { key: "memory", label: "Memory", cx: 100, cy: 50, r: 20, color: "#3b82f6" },
  { key: "reflection", label: "Reflections", cx: 230, cy: 130, r: 33, color: "#a855f7" }
];

// Optional: tweak brain outline (just a stylized SVG path for now)
const BRAIN_PATH = "M60,120 Q50,60 120,40 Q220,0 260,70 Q320,110 240,170 Q190,200 120,190 Q60,170 60,120 Z";

export default function BrainSelector({ selected, onSelect }) {
  return (
    <Card className="p-6 mb-4">
      <CardContent>
        <div className="flex flex-col items-center py-4">
          <h2 className="text-3xl font-black text-fuchsia-400 mb-2">🧠 Lex Brain Map</h2>
          <svg
            width={340}
            height={240}
            viewBox="0 0 340 220"
            className="bg-gradient-to-br from-blue-950/90 to-purple-950/80 rounded-3xl shadow-lg"
            style={{ border: "2px solid #39306a", marginBottom: 24 }}
          >
            {/* Soft glowing brain outline */}
            <motion.path
              d={BRAIN_PATH}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={8}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.55 }}
            />
            {/* Brain clusters */}
            {CLUSTERS.map(cluster => (
              <motion.circle
                key={cluster.key}
                cx={cluster.cx}
                cy={cluster.cy}
                r={cluster.r}
                fill={cluster.color}
                initial={{ opacity: 0.63, scale: 1 }}
                animate={{
                  opacity: selected === cluster.key ? 1 : 0.75,
                  scale: selected === cluster.key ? 1.15 : 1,
                  filter: selected === cluster.key
                    ? "drop-shadow(0 0 16px #fff8) drop-shadow(0 0 48px #fff6)"
                    : "drop-shadow(0 0 0px #0000)"
                }}
                whileHover={{ scale: 1.20, opacity: 1, filter: "drop-shadow(0 0 28px #fff7)" }}
                transition={{ type: "spring", stiffness: 180, damping: 14 }}
                onClick={() => onSelect(cluster.key)}
                style={{ cursor: "pointer" }}
              />
            ))}
            {/* Labels */}
            {CLUSTERS.map(cluster => (
              <motion.text
                key={cluster.key + "-label"}
                x={cluster.cx}
                y={cluster.cy}
                textAnchor="middle"
                fontSize={selected === cluster.key ? 20 : 15}
                fontWeight={selected === cluster.key ? 900 : 700}
                fill={selected === cluster.key ? "#fff" : "#c7baff"}
                style={{ pointerEvents: "none", userSelect: "none" }}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: selected === cluster.key ? 1 : 0.76, y: cluster.cy + (selected === cluster.key ? -cluster.r - 7 : -cluster.r - 2) }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
              >
                {cluster.label}
              </motion.text>
            ))}
          </svg>
          <div className="text-sm text-fuchsia-200 italic">Click a region to enter that symbolic mode.</div>
        </div>
      </CardContent>
    </Card>
  );
}

