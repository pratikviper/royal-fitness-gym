import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lightweight styled native <select>. Native is deliberate: it's accessible,
 * mobile-friendly, and avoids an extra Radix dependency for a simple picker.
 */
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-12 w-full appearance-none rounded-md border border-input bg-white/[0.02] px-4 pr-10 text-sm text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:border-royal focus-visible:ring-2 focus-visible:ring-royal/40",
            "disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-ink-panel [&>option]:text-foreground",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
