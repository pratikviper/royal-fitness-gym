import { Award, Target, Zap } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionTitle } from "@/components/shared/section-title";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { ImageReveal } from "@/components/shared/image-reveal";
import { AnimatedButton } from "@/components/shared/animated-button";

const pillars = [
  {
    icon: Target,
    title: "Results Driven",
    text: "Data-backed programming built around your goals and measured every step.",
  },
  {
    icon: Award,
    title: "Elite Coaching",
    text: "Certified, experienced coaches who train champions and beginners alike.",
  },
  {
    icon: Zap,
    title: "Luxury Facilities",
    text: "Premium equipment, recovery spa, and immaculate studios open early to late.",
  },
];

export function AboutPreview() {
  return (
    <section className="section-py">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Media */}
        <Reveal variant="right">
          <div className="relative">
            <ImageReveal
              src="/About.png"
              alt="Inside Royal Fitness"
              width={860}
              height={645}
              className="aspect-[4/3] rounded-3xl border border-white/10 lg:aspect-[4/5]"
            />
            {/* Floating stat card — sits inside the image on mobile, offset on larger screens */}
            <div className="glass-strong absolute bottom-4 right-4 rounded-2xl p-4 sm:p-5 lg:-bottom-6 lg:-right-6">
              <div className="font-heading text-3xl text-royal-gradient sm:text-4xl">
                2017
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                Serving Wagholi <br /> Since
              </div>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <div>
          <SectionTitle
            align="left"
            eyebrow="Who We Are"
            title="We Train Warriors, Not Members"
            description="Since 2017, Royal Fitness has been Wagholi's community-driven fitness hub — built on discipline, strength, and support. Real coaching, real results, for over 1,000 members across 20+ societies."
          />

          <StaggerGroup className="mt-10 space-y-6">
            {pillars.map((p) => (
              <StaggerItem
                key={p.title}
                className="flex items-start gap-4"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-royal/15 text-royal">
                  <p.icon className="size-6" />
                </span>
                <div>
                  <h3 className="font-heading text-xl tracking-wide">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <div className="mt-10">
            <AnimatedButton href="/about" variant="outline" shine={false}>
              Discover Our Story
            </AnimatedButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
