import { memoryUrl } from '../lib/api';
import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// 3D brain, always visible and colored, with auto-rotation
function BrainBase() {
  const { scene } = useGLTF("/models/symbolic-brain-final.glb");
  const group = useRef();

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.008;
    }
  });

  scene.traverse(child => {
    if (child.isMesh && child.material) {
      child.material.opacity = 1.0;
      child.material.transparent = false;
      child.material.color.set("#c9b29b");
      child.material.emissive.set("#000000");
      child.material.emissiveIntensity = 0.0;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}
useGLTF.preload("/models/symbolic-brain-final.glb");

// All symbolic sections, in sync with SymbolicMode.jsx
const SYMBOLIC_SECTIONS = [
  { key: "prompt", label: "Prompt", description: "Handles symbolic prompts, instructions, and agentic intent." },
  { key: "dream", label: "Dream", description: "LexSim dream space for subconscious reasoning and simulation." },
  { key: "trait_evolution", label: "Trait Evolution", description: "Tracks identity, self-modification, and symbolic growth." },
  { key: "trait_drift", label: "Trait Drift", description: "Shows deviation from base traits and alignment drift." },
  { key: "contradictions", label: "Contradictions", description: "Detects internal conflicts, overrides, and ethical issues." },
  { key: "memory", label: "Memory", description: "Persistent symbolic memory, logs, and reflection chain." },
  { key: "reflections", label: "Reflections", description: "Meta-cognitive feedback, learning, and self-narration." },
];

export default function LivingBrain({ selected, setSelected }) {
  const selectedSection = SYMBOLIC_SECTIONS.find(s => s.key === selected);

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 min-h-screen bg-gradient-to-tr from-purple-950/80 via-fuchsia-950/90 to-blue-950/90">
      <h1 className="text-4xl font-black text-fuchsia-400 mb-2 tracking-tight drop-shadow">
        🧠 Living Lex Brain
      </h1>
      <div style={{ width: 620, height: 500, margin: "auto", marginBottom: 24, position: "relative" }}>
        <Canvas camera={{ position: [0, 0, 6.2], fov: 38 }} shadows>
          <ambientLight intensity={1.0} />
          <directionalLight position={[4, 12, 9]} intensity={1.3} />
          <Suspense fallback={null}>
            <BrainBase />
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={true} />
        </Canvas>
      </div>
      {/* Symbolic tabs */}
      <div className="flex flex-wrap gap-3 justify-center mt-6 mb-2">
        {SYMBOLIC_SECTIONS.map(sec => (
          <button
            key={sec.key}
            onClick={() => setSelected(sec.key)}
            className={
              "px-5 py-2 rounded-xl font-bold transition-all duration-150 " +
              (selected === sec.key
                ? "bg-fuchsia-700 text-white shadow"
                : "bg-gray-900 border border-fuchsia-900 text-fuchsia-300 hover:bg-fuchsia-950/40")
            }
          >
            {sec.label}
          </button>
        ))}
      </div>
      {/* Panel below */}
      <div className="w-full max-w-3xl rounded-2xl shadow-xl mt-3 bg-gradient-to-tr from-[#1e1437e6] via-[#181635] to-[#2d204a] border border-fuchsia-900 min-h-[100px] flex flex-col items-center justify-center">
        <div className="text-xl font-bold text-fuchsia-300 py-2">{selectedSection?.label}</div>
        <div className="text-base text-fuchsia-100 pb-3">{selectedSection?.description}</div>
      </div>
    </div>
  );
}
