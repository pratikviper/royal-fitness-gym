"use client";

import Image, { type ImageProps } from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageRevealProps extends Omit<ImageProps, "className"> {
  className?: string;
  imgClassName?: string;
  /** reveal direction for the slide-in */
  from?: "bottom" | "left";
}

/**
 * Image with a compositing-safe reveal (opacity + slide + subtle scale settle).
 * We intentionally avoid animating `clip-path` here: on several mobile GPUs an
 * animated clip-path with a transformed child fails to paint, leaving the image
 * invisible. Opacity/transform reveals are reliable everywhere.
 * Wraps next/image so we keep optimization and lazy-loading.
 */
export function ImageReveal({
  className,
  imgClassName,
  from = "bottom",
  ...imageProps
}: ImageRevealProps) {
  const offset =
    from === "bottom" ? { y: 40, x: 0 } : { x: 40, y: 0 };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        initial={{ opacity: 0, ...offset, scale: 1.08 }}
        whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full"
      >
        {/* alt is required by the ImageRevealProps type and passed via imageProps */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          {...imageProps}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      </motion.div>
    </div>
  );
}
