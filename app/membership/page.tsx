import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { SectionTitle } from "@/components/shared/section-title";
import { PricingGrid } from "@/components/membership/pricing-grid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CtaBanner } from "@/sections/cta-banner";

export const metadata: Metadata = buildMetadata({
  title: "Membership",
  description:
    "Flexible Silver, Gold, Platinum and Diamond memberships — premium training, coaching and recovery. Cancel anytime.",
  path: "/membership",
});

const faqs = [
  {
    q: "What's included in each tier?",
    a: "Every tier includes full gym access. Higher tiers add unlimited classes, personal training sessions, recovery access, and VIP concierge on Diamond.",
  },
  {
    q: "Is there a joining fee?",
    a: "No hidden joining fees. You pay the monthly rate shown, and can upgrade or downgrade your tier at any time.",
  },
  {
    q: "Can I pause my membership?",
    a: "Yes, memberships can be frozen for up to 3 months per year at no cost — perfect for travel or recovery.",
  },
];

export default function MembershipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Find Your Perfect Plan"
        description="Four tiers, one standard: excellence. Choose the membership that matches your ambition — upgrade anytime."
      />

      <section className="pb-8">
        <Container>
          <PricingGrid />
        </Container>
      </section>

      <section className="section-py">
        <Container className="max-w-3xl">
          <SectionTitle eyebrow="Good to Know" title="Membership FAQ" />
          <div className="mt-10">
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
