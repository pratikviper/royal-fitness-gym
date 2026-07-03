"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";

interface DumbbellProps {
  position?: [number, number, number];
  scale?: number;
  rotationSpeed?: number;
  color?: string;
}

/**
 * A metallic dumbbell built from primitives (no external model needed).
 * Wrapped in <Float> for a gentle idle bob and given a slow self-rotation.
 */
export function Dumbbell({
  position = [0, 0, 0],
  scale = 1,
  rotationSpeed = 0.2,
  color = "#c9ccd1",
}: DumbbellProps) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * rotationSpeed;
      group.current.rotation.x += delta * rotationSpeed * 0.35;
    }
  });

  // Shared PBR material props for a chrome/steel look.
  const metal = { metalness: 1, roughness: 0.18, color };

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <group ref={group} position={position} scale={scale}>
        {/* Handle bar */}
        <mesh castShadow>
          <cylinderGeometry args={[0.14, 0.14, 2.4, 24]} />
          <meshStandardMaterial {...metal} roughness={0.3} />
        </mesh>

        {/* Weight plates — mirrored on each side */}
        {[-1, 1].map((side) => (
          <group key={side} position={[0, side * 1.15, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.62, 0.62, 0.34, 40]} />
              <meshStandardMaterial {...metal} />
            </mesh>
            <mesh castShadow position={[0, side * 0.28, 0]}>
              <cylinderGeometry args={[0.48, 0.48, 0.28, 40]} />
              <meshStandardMaterial {...metal} roughness={0.25} />
            </mesh>
            {/* Accent ring on the outer plate */}
            <mesh position={[0, side * 0.001, 0]}>
              <torusGeometry args={[0.62, 0.03, 16, 48]} />
              <meshStandardMaterial
                color="#e11d3a"
                metalness={0.6}
                roughness={0.3}
                emissive="#e11d3a"
                emissiveIntensity={0.25}
              />
            </mesh>
          </group>
        ))}
      </group>
    </Float>
  );
}
