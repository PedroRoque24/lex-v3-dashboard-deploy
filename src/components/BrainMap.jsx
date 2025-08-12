import { memoryUrl } from '../lib/api';
import React from "react";
import { motion } from "framer-motion";

// SVG paths for each lobe, extracted from a real anatomical brain SVG
const LOBES = [
  {
    key: "frontal",
    mode: "prompt",
    label: "Prompt",
    color: "#FFB347", // Frontal lobe: orange
    path: "M73,240 Q30,180 38,122 Q50,56 128,30 Q210,15 280,65 Q263,110 218,125 Q170,135 110,200 Q93,218 73,240 Z"
  },
  {
    key: "parietal",
    mode: "contradiction",
    label: "Contradictions",
    color: "#45B6FE", // Parietal: blue
    path: "M218,125 Q250,120 288,110 Q292,160 270,195 Q220,225 140,225 Q108,210 110,200 Q170,135 218,125 Z"
  },
  {
    key: "temporal",
    mode: "dream",
    label: "Dreams",
    color: "#AF7AC5", // Temporal: purple
    path: "M110,200 Q108,210 140,225 Q130,258 170,278 Q198,274 220,225 Q140,225 110,200 Z"
  },
  {
    key: "occipital",
    mode: "trait",
    label: "Trait Drift",
    color: "#D35400", // Occipital: reddish/orange
    path: "M288,110 Q324,152 314,196 Q265,245 220,225 Q270,195 288,110 Z"
  },
  {
    key: "cerebellum",
    mode: "reflection",
    label: "Reflections",
    color: "#F9E79F", // Cerebellum: yellow
    path: "M130,258 Q106,270 115,315 Q180,325 210,290 Q198,274 170,278 Q150,278 130,258 Z"
  },
  {
    key: "central",
    mode: "memory",
    label: "Memory",
    color: "#39A7F2", // Central sulcus: blue band
    path: "M128,30 Q140,60 170,110 Q200,60 210,15 Q210,15 128,30 Z"
  }
];

export default function BrainMap({ selected, onSelect }) {
  // Y-axis ("Earth-style") rotation
  const [angle, setAngle] = React.useState(0);

  React.useEffect(() => {
    let frame;
    let last = Date.now();
    const animate = () => {
      const now = Date.now();
      const delta = (now - last) / 1000;
      last = now;
      setAngle(a => (a + delta * 12) % 360); // 12 deg/sec for smooth slow rotation
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col items-center py-6">
      <h2 className="text-3xl font-black text-purple-900 mb-2">🧠 Lex Brain Map</h2>
      <div
        style={{
          width: 400,
          height: 340,
          marginBottom: 32,
          perspective: 1300,
          perspectiveOrigin: "50% 60%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <motion.svg
          width={340}
          height={320}
          viewBox="10 0 340 340"
          style={{
            background: "none",
            border: "none",
            transform: `rotateY(${angle}deg)`,
            transition: "transform 0.2s",
            display: "block"
          }}
        >
          {/* Brain outline for realism */}
          <motion.path
            d="M73,240 Q30,180 38,122 Q50,56 128,30 Q210,15 280,65 Q263,110 218,125 Q250,120 288,110 Q324,152 314,196 Q265,245 220,225 Q130,258 106,270 115,315 Q180,325 210,290 Q220,225 140,225 Q108,210 110,200 Q93,218 73,240 Z"
            fill="none"
            stroke="#6d28d9"
            strokeWidth={10}
            opacity={0.15}
          />
          {/* Brain lobes, perfectly anatomical */}
          {LOBES.map(lobe => (
            <motion.path
              key={lobe.key}
              d={lobe.path}
              fill={lobe.color}
              stroke="#fff"
              strokeWidth={selected === lobe.mode ? 7 : 2}
              opacity={selected === lobe.mode ? 1 : 0.93}
              style={{ cursor: "pointer" }}
              initial={{ scale: 1 }}
              animate={{
                scale: selected === lobe.mode ? 1.10 : 1,
                filter: selected === lobe.mode
                  ? `drop-shadow(0 0 14px ${lobe.color}e0) drop-shadow(0 0 35px #fff9)`
                  : "none"
              }}
              whileHover={{
                scale: 1.13,
                opacity: 1,
                filter: `drop-shadow(0 0 18px ${lobe.color}f0) drop-shadow(0 0 55px #fff9)`
              }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              onClick={() => onSelect(lobe.mode)}
            />
          ))}
          {/* Labels, centered in lobes */}
          {LOBES.map(lobe => {
            const LABEL_POS = {
              frontal: [130, 110],
              parietal: [220, 90],
              temporal: [165, 230],
              occipital: [260, 200],
              cerebellum: [170, 305],
              central: [170, 80]
            }[lobe.key] || [160, 130];
            return (
              <motion.text
                key={lobe.key + "-label"}
                x={LABEL_POS[0]}
                y={LABEL_POS[1]}
                textAnchor="middle"
                fontSize={selected === lobe.mode ? 22 : 15}
                fontWeight={selected === lobe.mode ? 900 : 700}
                fill={selected === lobe.mode ? "#18181b" : "#333"}
                style={{ pointerEvents: "none", userSelect: "none" }}
                initial={{ opacity: 0.92 }}
                animate={{
                  opacity: selected === lobe.mode ? 1 : 0.85,
                  y: LABEL_POS[1] + (selected === lobe.mode ? -13 : 0)
                }}
                transition={{ type: "spring", stiffness: 170, damping: 20 }}
              >
                {lobe.label}
              </motion.text>
            );
          })}
        </motion.svg>
      </div>
      <div className="text-sm text-gray-500 italic mb-2">
        Click a brain region to enter that symbolic mode.
      </div>
    </div>
  );
}

