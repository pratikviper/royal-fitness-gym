"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { lerp } from "@/lib/utils";

/**
 * Smoothly steers the camera toward the pointer for a subtle parallax feel.
 * Uses R3F's normalized pointer (-1..1) and eases each frame.
 */
export function CameraRig({ intensity = 1 }: { intensity?: number }) {
  const { camera, pointer } = useThree();

  useFrame(() => {
    const targetX = pointer.x * 1.4 * intensity;
    const targetY = pointer.y * 0.9 * intensity + 0.5;

    camera.position.x = lerp(camera.position.x, targetX, 0.04);
    camera.position.y = lerp(camera.position.y, targetY, 0.04);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
