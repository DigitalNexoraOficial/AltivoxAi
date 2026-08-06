"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function NodeField() {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 42; i++) {
      arr.push([
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 4,
      ]);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.getElapsedTime() * 0.05;
    group.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.08;
  });

  return (
    <group ref={group}>
      {points.map((p, i) => (
        <Float key={i} speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
          <mesh position={p}>
            <sphereGeometry args={[0.035 + (i % 3) * 0.01, 12, 12]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#22d3ee" : "#a855f7"}
              emissive={i % 2 === 0 ? "#22d3ee" : "#a855f7"}
              emissiveIntensity={0.7}
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        </Float>
      ))}
      <mesh>
        <torusGeometry args={[2.2, 0.01, 12, 120]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0.4, 0]}>
        <torusGeometry args={[1.5, 0.008, 12, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 5]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[-4, -2, 2]} intensity={0.7} color="#a855f7" />
      <NodeField />
    </Canvas>
  );
}
