import { memberships } from "@/data/memberships";
import { PricingCard } from "@/components/membership/pricing-card";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";

/** Responsive grid of the four membership tiers. */
export function PricingGrid() {
  return (
    <StaggerGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {memberships.map((plan) => (
        <StaggerItem key={plan.id}>
          <PricingCard plan={plan} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
