import { Container } from "@/components/shared/container";
import { SectionTitle } from "@/components/shared/section-title";
import { GlassCard } from "@/components/shared/glass-card";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { facilities } from "@/data/facilities";

export function Facilities() {
  return (
    <section className="section-py">
      <Container>
        <SectionTitle
          eyebrow="The Experience"
          title="World-Class Facilities"
          description="Every detail engineered for performance, recovery, and comfort."
        />

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <StaggerItem key={f.id}>
              <GlassCard glow className="group h-full">
                <span className="grid size-14 place-items-center rounded-2xl bg-royal/15 text-royal transition-colors group-hover:bg-royal group-hover:text-white">
                  <f.icon className="size-7" />
                </span>
                <h3 className="mt-5 font-heading text-2xl tracking-wide text-metallic">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {f.description}
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
