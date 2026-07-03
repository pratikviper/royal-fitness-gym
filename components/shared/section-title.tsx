import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";
import { SplitText } from "@/components/shared/split-text";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** render title with per-character animation */
  animateTitle?: boolean;
}

/** Reusable eyebrow + heading + description block used at the top of sections. */
export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  animateTitle = true,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <Reveal variant="fade">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-royal">
            <span className="h-px w-8 bg-royal" />
            {eyebrow}
          </span>
        </Reveal>
      )}

      <h2 className="max-w-3xl text-4xl leading-[0.95] text-metallic sm:text-5xl md:text-6xl">
        {animateTitle ? <SplitText text={title} /> : title}
      </h2>

      {description && (
        <Reveal variant="up" delay={0.1}>
          <p
            className={cn(
              "max-w-2xl text-base text-muted-foreground md:text-lg",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
