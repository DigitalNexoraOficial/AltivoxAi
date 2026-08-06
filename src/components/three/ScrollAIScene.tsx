"use client";

import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type ScrollState = { progress: number; velocity: number };

function useScrollState(scroll: React.MutableRefObject<ScrollState>) {
  useEffect(() => {
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;

    const tick = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const y = window.scrollY;
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      scroll.current.progress = Math.min(Math.max(y / max, 0), 1);
      scroll.current.velocity = (y - lastY) / dt;
      lastY = y;
      lastT = now;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scroll]);
}

function NeuralField({
  scroll,
  quality,
}: {
  scroll: React.MutableRefObject<ScrollState>;
  quality: "high" | "medium" | "low";
}) {
  const group = useRef<THREE.Group>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const orbitA = useRef<THREE.Mesh>(null);
  const orbitB = useRef<THREE.Mesh>(null);
  const orbitC = useRef<THREE.Mesh>(null);

  const nodeCount = quality === "high" ? 140 : quality === "medium" ? 96 : 64;
  const coreDetail = quality === "high" ? 5 : quality === "medium" ? 4 : 3;
  const ringSeg = quality === "high" ? 256 : quality === "medium" ? 180 : 120;
  const connectDist = quality === "high" ? 2.15 : 2.35;

  const { positions, linePositions, colors } = useMemo(() => {
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);
    const pts: THREE.Vector3[] = [];
    const cA = new THREE.Color("#22d3ee");
    const cB = new THREE.Color("#a855f7");

    for (let i = 0; i < nodeCount; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 11,
        (Math.random() - 0.5) * 7.5,
        (Math.random() - 0.5) * 9
      );
      pts.push(v);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
      const mix = i % 2 === 0 ? cA : cB;
      colors[i * 3] = mix.r;
      colors[i * 3 + 1] = mix.g;
      colors[i * 3 + 2] = mix.b;
    }

    const connections: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      let links = 0;
      for (let j = i + 1; j < nodeCount && links < 5; j++) {
        if (pts[i].distanceTo(pts[j]) < connectDist) {
          connections.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
          links += 1;
        }
      }
    }
    return { positions, linePositions: new Float32Array(connections), colors };
  }, [nodeCount, connectDist]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = scroll.current.progress;
    const v = scroll.current.velocity;

    if (group.current) {
      group.current.rotation.y = t * 0.045 + p * Math.PI * 1.45;
      group.current.rotation.x = Math.sin(t * 0.16) * 0.1 + p * 0.62;
      group.current.position.y = -p * 3.1;
      group.current.position.z = p * 1.85;
    }
    if (core.current) {
      core.current.rotation.y = t * 0.32 + p * 2.4;
      core.current.rotation.z = t * 0.1;
      const s = 1 + Math.sin(t * 1.35) * 0.035 + Math.min(Math.abs(v) * 0.12, 0.1);
      core.current.scale.setScalar(s);
    }
    if (shell.current) {
      const m = shell.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.1 + Math.sin(t * 2) * 0.035;
      shell.current.rotation.y = -t * 0.18;
    }
    if (orbitA.current) orbitA.current.rotation.z = t * 0.55;
    if (orbitB.current) orbitB.current.rotation.y = t * 0.38;
    if (orbitC.current) orbitC.current.rotation.x = t * 0.28;
    if (lines.current) {
      const mat = lines.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.2 + Math.sin(t * 1.15 + p * 4) * 0.07;
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={quality === "high" ? 0.055 : 0.045}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={lines}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#67e8f9" transparent opacity={0.24} blending={THREE.AdditiveBlending} />
      </lineSegments>

      <mesh ref={core}>
        <icosahedronGeometry args={[1.12, coreDetail]} />
        <meshPhysicalMaterial
          color="#d8fbff"
          emissive="#22d3ee"
          emissiveIntensity={1.05}
          roughness={0.08}
          metalness={0.45}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transmission={quality === "low" ? 0.12 : 0.34}
          thickness={0.8}
          ior={1.4}
          transparent
          opacity={0.95}
        />
      </mesh>

      <mesh ref={shell}>
        <sphereGeometry args={[1.45, quality === "high" ? 64 : 32, quality === "high" ? 64 : 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <mesh ref={orbitA} rotation={[Math.PI / 2.4, 0.3, 0]}>
        <torusGeometry args={[2.15, 0.014, 20, ringSeg]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.42} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={orbitB} rotation={[Math.PI / 1.7, 0.8, 0.4]}>
        <torusGeometry args={[2.75, 0.012, 20, ringSeg]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.34} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={orbitC} rotation={[0.4, 1.1, 0.2]}>
        <torusGeometry args={[3.25, 0.008, 16, ringSeg]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function SceneController({
  scroll,
  quality,
  setDpr,
}: {
  scroll: React.MutableRefObject<ScrollState>;
  quality: "high" | "medium" | "low";
  setDpr: (dpr: number) => void;
}) {
  const { gl } = useThree();

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 2.5 : quality === "medium" ? 1.75 : 1.25));
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl, quality]);

  return (
    <>
      <PerformanceMonitor
        onIncline={() => setDpr(Math.min(window.devicePixelRatio || 1, 2.5))}
        onDecline={() => setDpr(1.25)}
        flipflops={4}
        onFallback={() => setDpr(1)}
      />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <NeuralField scroll={scroll} quality={quality} />
    </>
  );
}

export default function ScrollAIScene() {
  const scroll = useRef<ScrollState>({ progress: 0, velocity: 0 });
  useScrollState(scroll);

  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    if (mobile || cores <= 4 || mem <= 4) setQuality("medium");
    if (cores <= 2 || mem <= 2) setQuality("low");
    const maxDpr = mobile ? 1.5 : Math.min(window.devicePixelRatio || 1, 2.5);
    setDpr(maxDpr);
  }, []);

  return (
    <Canvas
      dpr={dpr}
      frameloop="always"
      flat={false}
      camera={{ position: [0, 0, 7.1], fov: 42, near: 0.1, far: 40 }}
      gl={{
        antialias: quality !== "low",
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <fog attach="fog" args={["#050505", 7, 18]} />
      <ambientLight intensity={0.28} />
      <pointLight position={[4.2, 3.2, 5]} intensity={1.45} color="#22d3ee" />
      <pointLight position={[-4.4, -2.2, 2.2]} intensity={0.95} color="#a855f7" />
      <spotLight position={[0, 5, 2]} angle={0.55} penumbra={0.85} intensity={1.1} color="#e0faff" />
      <SceneController scroll={scroll} quality={quality} setDpr={setDpr} />
    </Canvas>
  );
}
