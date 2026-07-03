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
    "Royal Fitness packages — Weight Training, Weight Training + Cardio, and All In One. Flexible 3, 6, and 12-month plans.",
  path: "/membership",
});

const faqs = [
  {
    q: "What's the difference between the packages?",
    a: "Weight Training covers the strength floor with a workout plan and certified trainers. Weight Training + Cardio adds the full cardio zone, functional training and nutrition guidance. All In One includes 1-on-1 personal training and complete result-focused coaching.",
  },
  {
    q: "Is there a joining fee?",
    a: "Yes — a one-time ₹300 entry charge is compulsory when you join, in addition to your chosen package price.",
  },
  {
    q: "Can I refund, transfer, or freeze my membership?",
    a: "Memberships are non-refundable, non-transferable, and cannot be frozen. Please choose the duration that best fits your schedule.",
  },
];

export default function MembershipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Find Your Perfect Plan"
        description="Three packages, one standard: excellence. Choose the plan and duration that match your goals."
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
