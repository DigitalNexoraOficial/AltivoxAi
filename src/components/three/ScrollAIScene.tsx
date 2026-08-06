"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type ScrollState = { progress: number; velocity: number };

function NeuralField({ scroll }: { scroll: React.MutableRefObject<ScrollState> }) {
  const group = useRef<THREE.Group>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const core = useRef<THREE.Mesh>(null);

  const { positions, linePositions } = useMemo(() => {
    const count = 72;
    const positions = new Float32Array(count * 3);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 8
      );
      pts.push(v);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    }

    const connections: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (pts[i].distanceTo(pts[j]) < 2.35) {
          connections.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }
    return { positions, linePositions: new Float32Array(connections) };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = scroll.current.progress;
    const v = scroll.current.velocity;

    if (group.current) {
      group.current.rotation.y = t * 0.05 + p * Math.PI * 1.35;
      group.current.rotation.x = Math.sin(t * 0.18) * 0.12 + p * 0.55;
      group.current.position.y = -p * 2.8;
      group.current.position.z = p * 1.6;
    }
    if (core.current) {
      core.current.rotation.y = t * 0.35 + p * 2.2;
      core.current.rotation.z = t * 0.12;
      const s = 1 + Math.sin(t * 1.4) * 0.04 + Math.min(Math.abs(v) * 0.15, 0.12);
      core.current.scale.setScalar(s);
    }
    if (lines.current) {
      const mat = lines.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.18 + Math.sin(t * 1.2 + p * 4) * 0.06;
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.045} color="#22d3ee" transparent opacity={0.85} sizeAttenuation depthWrite={false} />
      </points>

      <lineSegments ref={lines}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#67e8f9" transparent opacity={0.22} />
      </lineSegments>

      <mesh ref={core}>
        <icosahedronGeometry args={[1.05, 2]} />
        <meshPhysicalMaterial
          color="#b8f7ff"
          emissive="#22d3ee"
          emissiveIntensity={0.75}
          roughness={0.18}
          metalness={0.35}
          transmission={0.25}
          thickness={0.55}
          transparent
          opacity={0.92}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2.4, 0.3, 0]}>
        <torusGeometry args={[2.1, 0.012, 12, 140]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 1.7, 0.8, 0.4]}>
        <torusGeometry args={[2.7, 0.01, 12, 160]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

export default function ScrollAIScene() {
  const scroll = useRef<ScrollState>({ progress: 0, velocity: 0 });

  useEffect(() => {
    let lastY = window.scrollY;
    let lastT = performance.now();

    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const y = window.scrollY;
      const now = performance.now();
      const dt = Math.max(now - lastT, 16);
      scroll.current.progress = Math.min(Math.max(y / max, 0), 1);
      scroll.current.velocity = (y - lastY) / dt;
      lastY = y;
      lastT = now;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 1.35]}
      camera={{ position: [0, 0, 7.2], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <fog attach="fog" args={["#050505", 6, 16]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[4, 3, 5]} intensity={1.15} color="#22d3ee" />
      <pointLight position={[-4, -2, 2]} intensity={0.75} color="#a855f7" />
      <NeuralField scroll={scroll} />
    </Canvas>
  );
}
