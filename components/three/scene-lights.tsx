"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { SpotLight as ThreeSpotLight } from "three";

/**
 * Cinematic lighting: cool ambient fill + a warm key spotlight and a moving
 * royal-red rim spotlight that sweeps slowly across the scene.
 */
export function SceneLights() {
  const redSpot = useRef<ThreeSpotLight>(null);

  useFrame((state) => {
    if (redSpot.current) {
      const t = state.clock.elapsedTime * 0.4;
      redSpot.current.position.x = Math.sin(t) * 6;
      redSpot.current.position.z = Math.cos(t) * 6;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#8ea3c0" />

      {/* Key light */}
      <spotLight
        position={[6, 8, 6]}
        angle={0.5}
        penumbra={0.8}
        intensity={120}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Moving royal-red rim light */}
      <spotLight
        ref={redSpot}
        position={[-6, 4, -4]}
        angle={0.7}
        penumbra={1}
        intensity={90}
        color="#e11d3a"
        distance={30}
      />

      {/* Cool back fill for silhouette separation */}
      <pointLight position={[0, -4, -6]} intensity={30} color="#3b6cff" />
    </>
  );
}
