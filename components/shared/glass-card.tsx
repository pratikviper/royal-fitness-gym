import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

/** Frosted-glass surface used for feature cards, stats, and overlays. */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-500",
        "hover:border-royal/40 hover:bg-white/[0.06]",
        glow && "hover:shadow-glow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
GlassCard.displayName = "GlassCard";
