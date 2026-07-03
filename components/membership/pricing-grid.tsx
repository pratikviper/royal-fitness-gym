import { Info } from "lucide-react";
import {
  memberships,
  ENTRY_CHARGE,
  membershipPolicies,
} from "@/data/memberships";
import { PricingCard } from "@/components/membership/pricing-card";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { formatCurrency } from "@/lib/utils";

/** Responsive grid of the three membership packages + policy notes. */
export function PricingGrid() {
  return (
    <div>
      <StaggerGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {memberships.map((plan) => (
          <StaggerItem key={plan.id}>
            <PricingCard plan={plan} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Policy notes (from the studio pricing board) */}
      <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-6">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="size-4 text-royal" />
          {formatCurrency(ENTRY_CHARGE, "INR", "en-IN")} one-time entry charge
          (compulsory)
        </span>
        <span className="rounded-full border border-royal/40 bg-royal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-royal">
          {membershipPolicies.join(" · ")}
        </span>
      </div>
    </div>
  );
}
