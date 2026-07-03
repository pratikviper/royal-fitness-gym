"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { MetallicParticles } from "@/components/three/metallic-particles";
import { CameraRig } from "@/components/three/camera-rig";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * Transparent Three.js FX layer that sits ON TOP of the hero photo: drifting
 * metallic dust + rising red embers, with a mouse-driven camera parallax.
 *
 * Deliberately light — no HDRI/fog/shadows — so it composites cleanly over the
 * photograph and stays at 60 FPS. Reduced-motion users skip the camera rig.
 */
export function HeroFx() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9], fov: 45 }}
      className="!absolute inset-0"
    >
      {/* Silver dust */}
      <MetallicParticles
        count={isMobile ? 160 : 340}
        color="#c7cad0"
        size={0.04}
        opacity={0.5}
      />
      {/* Rising red embers — echoes the sparks in the photo */}
      <MetallicParticles
        count={isMobile ? 60 : 130}
        radius={9}
        color="#e11d3a"
        size={0.07}
        opacity={0.8}
        rise
      />

      {!reduced && <CameraRig intensity={0.5} />}
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
