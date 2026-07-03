import { Container } from "@/components/shared/container";
import { SectionTitle } from "@/components/shared/section-title";
import { AnimatedButton } from "@/components/shared/animated-button";
import { TrainerCard } from "@/components/trainer/trainer-card";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { trainers } from "@/data/trainers";

export function TrainerPreview() {
  const featured = trainers.slice(0, 4);

  return (
    <section className="section-py">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionTitle
            align="left"
            eyebrow="The Team"
            title="Coaches Who Build Champions"
            description="Train with certified experts across strength, conditioning, mobility and performance."
          />
          <div className="shrink-0">
            <AnimatedButton href="/trainers" variant="outline" shine={false}>
              View All Trainers
            </AnimatedButton>
          </div>
        </div>

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((trainer) => (
            <StaggerItem key={trainer.id}>
              <TrainerCard trainer={trainer} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
