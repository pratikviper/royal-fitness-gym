import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** render a slightly smaller mark (e.g. mobile drawer header) */
  compact?: boolean;
}

/**
 * Full horizontal brand lockup (emblem + wordmark). Links home.
 * The source PNG has a solid black background, so `mix-blend-screen` drops the
 * black and lets only the emblem + metallic wordmark show over any dark surface.
 */
export function Logo({ className, compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Royal Fitness — home"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src="/logo1.png"
        alt="Royal Fitness"
        width={360}
        height={180}
        priority
        className={cn(
          "w-auto object-contain mix-blend-screen",
          compact ? "h-12" : "h-12 md:h-14",
        )}
      />
    </Link>
  );
}
