import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SplitText } from "@/components/shared/split-text";
import { AnimatedButton } from "@/components/shared/animated-button";

export function CtaBanner() {
  return (
    <section className="section-py">
      <Container>
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl border border-royal/30 bg-gradient-to-br from-royal/20 via-ink-panel to-ink px-6 py-16 text-center md:px-16 md:py-24">
            {/* Decorative glows */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-royal/30 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-royal/20 blur-[100px]" />

            <span className="relative text-xs font-semibold uppercase tracking-[0.3em] text-royal">
              Start Today
            </span>
            <h2 className="relative mx-auto mt-4 max-w-3xl text-4xl leading-[0.95] text-metallic sm:text-5xl md:text-6xl">
              <SplitText text="Your Transformation Begins Now" />
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-muted-foreground">
              Claim your complimentary trial session and experience the Royal
              Fitness difference for yourself.
            </p>

            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
              <AnimatedButton href="/membership" size="lg">
                Become a Member
              </AnimatedButton>
              <AnimatedButton
                href="/contact"
                size="lg"
                variant="outline"
                shine={false}
              >
                Book a Free Trial
              </AnimatedButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
