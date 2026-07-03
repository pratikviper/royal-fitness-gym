"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  ContactShadows,
  Environment,
  PerformanceMonitor,
} from "@react-three/drei";
import { Dumbbell } from "@/components/three/dumbbell";
import { MetallicParticles } from "@/components/three/metallic-particles";
import { CameraRig } from "@/components/three/camera-rig";
import { SceneLights } from "@/components/three/scene-lights";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * Immersive hero scene: floating metallic dumbbells, drifting particles,
 * moving spotlights, soft fog and mouse-driven camera parallax.
 *
 * Performance: adaptive DPR + a PerformanceMonitor that dials quality down on
 * weaker devices, fewer particles on mobile, and reduced-motion fallback.
 */
export function HeroScene() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const [dpr, setDpr] = useState<number>(1.5);

  const particleCount = isMobile ? 250 : 600;

  return (
    <Canvas
      shadows
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.5, 9], fov: 45 }}
      className="!absolute inset-0"
    >
      {/* Soft fog for depth */}
      <fog attach="fog" args={["#050505", 8, 22]} />

      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(1.5)}
      />

      <Suspense fallback={null}>
        <SceneLights />

        {/* Hero cluster of floating metallic dumbbells */}
        <Dumbbell position={[0, 0.2, 0]} scale={1.05} color="#d3d6db" />
        <Dumbbell
          position={[-3.6, 1.4, -2]}
          scale={0.55}
          rotationSpeed={0.3}
          color="#b8bcc4"
        />
        <Dumbbell
          position={[3.5, -1.3, -1.5]}
          scale={0.65}
          rotationSpeed={0.16}
          color="#c9ccd1"
        />
        {!isMobile && (
          <Dumbbell
            position={[2.6, 2.1, -3]}
            scale={0.4}
            rotationSpeed={0.35}
            color="#a9adb5"
          />
        )}

        <MetallicParticles count={particleCount} />

        {/* Grounding reflection/shadow */}
        <ContactShadows
          position={[0, -3.2, 0]}
          opacity={0.55}
          scale={22}
          blur={2.6}
          far={6}
          color="#000000"
        />

        {/* HDRI for realistic metallic reflections */}
        <Environment preset="city" />
      </Suspense>

      {!reduced && <CameraRig />}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
