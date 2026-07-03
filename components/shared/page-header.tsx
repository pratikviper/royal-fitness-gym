import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SplitText } from "@/components/shared/split-text";

/** Standard hero header for interior pages (About, Membership, etc.). */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-20">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-royal/20 blur-[120px]" />

      <Container className="relative text-center">
        {eyebrow && (
          <Reveal variant="fade">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-royal">
              {eyebrow}
            </span>
          </Reveal>
        )}
        <h1 className="mt-4 text-5xl leading-[0.9] text-metallic sm:text-6xl md:text-7xl">
          <SplitText text={title} />
        </h1>
        {description && (
          <Reveal variant="up" delay={0.1}>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              {description}
            </p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
