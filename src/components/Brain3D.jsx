import { memoryUrl } from '../lib/api';
import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function AnatomicalBrain({ color }) {
  const { scene } = useGLTF("/models/human-brain.glb");
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        // Set color safely for any mesh
        child.material.color.set(color);
      }
    });
  }, [scene, color]);
  return <primitive object={scene} />;
}
useGLTF.preload("/models/human-brain.glb");

export default function Brain3D({ selected }) {
  // Symbolic mode color mapping
  const modeColor = {
    prompt: "#FFA040",
    contradiction: "#45B6FE",
    dream: "#A259F7",
    trait: "#D35400",
    reflection: "#F9E79F",
    memory: "#39A7F2"
  };
  const color = modeColor[selected] || "#B39DDB";

  return (
    <div style={{ width: 500, height: 420, margin: "auto", marginBottom: 24 }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 46 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 6]} intensity={1.2} />
        <Suspense fallback={null}>
          <AnatomicalBrain color={color} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
      <div className="text-sm text-gray-500 italic mt-2" style={{ textAlign: "center" }}>
        (Real anatomical brain mesh! Tint changes with symbolic mode.)
      </div>
    </div>
  );
}

