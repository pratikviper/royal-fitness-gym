"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points } from "three";

interface ParticlesProps {
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
  opacity?: number;
  /** ember mode: particles drift upward and recycle */
  rise?: boolean;
}

/**
 * Floating dust / embers. A single <points> cloud (one draw call) that drifts
 * and slowly rotates — cheap and atmospheric. In `rise` mode it doubles as an
 * ember layer that floats upward.
 */
export function MetallicParticles({
  count = 600,
  radius = 12,
  color = "#d6d8dc",
  size = 0.045,
  opacity = 0.7,
  rise = false,
}: ParticlesProps) {
  const ref = useRef<Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute within a sphere shell for depth.
      const r = radius * Math.cbrt(0.2 + Math.random() * 0.8);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, radius]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.03;

    if (rise) {
      // Ember drift: move points upward and wrap them back to the bottom.
      const attr = ref.current.geometry.getAttribute("position");
      const arr = attr.array as Float32Array;
      for (let i = 1; i < arr.length; i += 3) {
        arr[i] += delta * 0.8;
        if (arr[i] > radius) arr[i] = -radius;
      }
      attr.needsUpdate = true;
    } else {
      // subtle vertical breathing
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.4;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        sizeAttenuation
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  );
}
