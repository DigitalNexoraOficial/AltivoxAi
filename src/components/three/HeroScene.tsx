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

function AICore() {
  const core = useRef<THREE.Group>(null);
  const orbitA = useRef<THREE.Mesh>(null);
  const orbitB = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (core.current) {
      core.current.rotation.y = t * 0.18;
      core.current.rotation.x = Math.sin(t * 0.25) * 0.12;
      core.current.position.y = Math.sin(t * 0.7) * 0.12;
    }
    if (orbitA.current) orbitA.current.rotation.z = t * 0.6;
    if (orbitB.current) orbitB.current.rotation.y = t * 0.45;
    if (shell.current) {
      const m = shell.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.12 + Math.sin(t * 2.2) * 0.04;
    }
  });

  return (
    <group ref={core} position={[1.5, 0.2, 0.2]}>
      <mesh>
        <icosahedronGeometry args={[0.95, 3]} />
        <meshPhysicalMaterial
          color="#c4fbff"
          emissive="#22d3ee"
          emissiveIntensity={0.95}
          roughness={0.12}
          metalness={0.4}
          transmission={0.32}
          thickness={0.7}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>
      <mesh ref={shell}>
        <sphereGeometry args={[1.28, 32, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.14} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={orbitA} rotation={[Math.PI / 5, 0.4, 0]}>
        <torusGeometry args={[1.55, 0.02, 16, 160]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.42} />
      </mesh>
      <mesh ref={orbitB} rotation={[Math.PI / 1.95, 0.2, 0.7]}>
        <torusGeometry args={[1.95, 0.014, 16, 180]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.34} />
      </mesh>
      {Array.from({ length: 22 }).map((_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const r = 2.4 + (i % 5) * 0.15;
        return (
          <mesh key={i} position={[Math.cos(a) * r, Math.sin(a * 1.7) * 0.55, Math.sin(a) * r * 0.45]}>
            <sphereGeometry args={[0.026 + (i % 3) * 0.01, 10, 10]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#22d3ee" : "#a855f7"} transparent opacity={0.8} />
          </mesh>
        );
      })}
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
      <fog attach="fog" args={["#05070d", 5, 13]} />
      <ambientLight intensity={0.26} />
      <pointLight position={[3.8, 2.8, 4.8]} intensity={1.45} color="#22d3ee" />
      <pointLight position={[-4.2, -2.5, 2.4]} intensity={0.9} color="#a855f7" />
      <spotLight position={[1.2, 3.8, 2.4]} angle={0.52} penumbra={1} intensity={1.2} color="#67e8f9" />
      <spotLight position={[-2.8, 1.8, 1]} angle={0.62} penumbra={1} intensity={0.8} color="#c084fc" />
      <NodeField />
      <AICore />
    </Canvas>
  );
}
