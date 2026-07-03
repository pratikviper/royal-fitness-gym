import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { TrainerGrid } from "@/components/trainer/trainer-grid";
import { CtaBanner } from "@/sections/cta-banner";

export const metadata: Metadata = buildMetadata({
  title: "Trainers",
  description:
    "Meet the Royal Fitness coaching team — certified experts in strength, conditioning, mobility, boxing and performance.",
  path: "/trainers",
});

export default function TrainersPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Team"
        title="Meet Your Coaches"
        description="Our certified personal trainers specialize in strength, cardio, functional training and more — ready to guide your transformation."
      />

      <section className="pb-8">
        <Container>
          <TrainerGrid />
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
