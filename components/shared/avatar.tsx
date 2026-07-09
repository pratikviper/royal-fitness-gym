"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "size-9 text-[10px]",
    md: "size-10 text-xs",
    lg: "size-16 text-lg",
    xl: "size-24 text-3xl",
  };

  const showImage = src && !hasError;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border border-white/10 overflow-hidden select-none",
        sizeClasses[size],
        !showImage && "bg-gradient-to-br from-royal/50 via-royal to-royal-dark text-white font-heading font-black tracking-wider shadow-inner",
        className
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
