import { Container } from "@/components/shared/container";
import { SectionTitle } from "@/components/shared/section-title";
import { PricingGrid } from "@/components/membership/pricing-grid";

export function MembershipPreview() {
  return (
    <section className="section-py relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-royal/10 blur-[140px]" />
      <Container className="relative">
        <SectionTitle
          eyebrow="Membership"
          title="Choose Your Tier"
          description="From Silver to Diamond — flexible plans crafted for every level of ambition. Cancel anytime."
        />
        <div className="mt-14">
          <PricingGrid />
        </div>
      </Container>
    </section>
  );
}
