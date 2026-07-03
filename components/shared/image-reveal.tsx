"use client";

import Image, { type ImageProps } from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageRevealProps extends Omit<ImageProps, "className"> {
  className?: string;
  imgClassName?: string;
  /** clip-path reveal direction */
  from?: "bottom" | "left";
}

/**
 * Image with a clip-path reveal + subtle scale settle on scroll-in.
 * Wraps next/image so we keep optimization, lazy-loading and blur support.
 */
export function ImageReveal({
  className,
  imgClassName,
  from = "bottom",
  ...imageProps
}: ImageRevealProps) {
  const initialClip =
    from === "bottom"
      ? "inset(100% 0% 0% 0%)"
      : "inset(0% 100% 0% 0%)";

  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: initialClip }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full"
      >
        {/* alt is required by the ImageRevealProps type and passed via imageProps */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          {...imageProps}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      </motion.div>
    </motion.div>
  );
}
