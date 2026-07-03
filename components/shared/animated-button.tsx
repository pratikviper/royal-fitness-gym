"use client";

import Link from "next/link";
import { Magnetic } from "@/components/shared/magnetic";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  href?: string;
  magnetic?: boolean;
  shine?: boolean;
}

/**
 * Premium CTA button: optional magnetic pull + a sweeping shine highlight on
 * hover. Renders as a Next <Link> when `href` is provided.
 */
export function AnimatedButton({
  href,
  magnetic = true,
  shine = true,
  className,
  children,
  ...props
}: AnimatedButtonProps) {
  const content = (
    <Button
      className={cn("group relative overflow-hidden", className)}
      asChild={!!href}
      {...props}
    >
      {href ? (
        <Link href={href}>
          <span className="relative z-10 inline-flex items-center gap-2">
            {children}
          </span>
          {shine && <Shine />}
        </Link>
      ) : (
        <>
          <span className="relative z-10 inline-flex items-center gap-2">
            {children}
          </span>
          {shine && <Shine />}
        </>
      )}
    </Button>
  );

  return magnetic ? <Magnetic strength={0.25}>{content}</Magnetic> : content;
}

function Shine() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
    />
  );
}
