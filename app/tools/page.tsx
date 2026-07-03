import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { PlanGenerator } from "@/components/tools/plan-generator";
import { CtaBanner } from "@/sections/cta-banner";

export const metadata: Metadata = buildMetadata({
  title: "Free Plans",
  description:
    "Generate a free personalized workout split and diet plan — set your goal, level and stats to get exercises, calories and macros instantly.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free Tools"
        title="Workout & Diet Generators"
        description="Get a personalized weekly training split and a calorie + macro meal plan in seconds — free, no signup required."
      />

      <section className="pb-16">
        <Container>
          <PlanGenerator />
        </Container>
      </section>

      <section className="pb-12">
        <Container>
          <p className="mx-auto max-w-3xl text-center text-xs text-muted-foreground">
            These plans are AI-style estimates for general guidance only and are
            not medical or dietary advice. For a plan tailored to you, book a
            session with our certified trainers.
          </p>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
