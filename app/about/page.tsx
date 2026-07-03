import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { SectionTitle } from "@/components/shared/section-title";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { ImageReveal } from "@/components/shared/image-reveal";
import { Counter } from "@/components/shared/counter";
import { GlassCard } from "@/components/shared/glass-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CtaBanner } from "@/sections/cta-banner";
import { stats } from "@/data/facilities";
import { Gem, HeartHandshake, ShieldCheck, Trophy } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Discover the story, values, and mission behind Royal Fitness — an elite training club built on discipline, excellence, and results.",
  path: "/about",
});

const values = [
  {
    icon: Trophy,
    title: "Excellence",
    text: "We pursue mastery in coaching, facilities, and service — never settling for average.",
  },
  {
    icon: HeartHandshake,
    title: "Community",
    text: "A supportive, motivating environment where every member belongs and thrives.",
  },
  {
    icon: ShieldCheck,
    title: "Integrity",
    text: "Honest programming and transparent guidance focused on your long-term health.",
  },
  {
    icon: Gem,
    title: "Premium",
    text: "A luxury experience in every detail, from equipment to the recovery spa.",
  },
];

const faqs = [
  {
    q: "Do you offer a free trial?",
    a: "Yes — new members can book a complimentary trial session to experience the club, meet a coach, and tour the facilities before committing.",
  },
  {
    q: "Can I freeze or cancel my membership?",
    a: "Absolutely. All plans are flexible with no long lock-ins. You can freeze or cancel anytime from your member account or by contacting the front desk.",
  },
  {
    q: "Are personal trainers included?",
    a: "Personal training is included from the Gold tier and up, with unlimited sessions and a dedicated head coach on the Diamond plan.",
  },
  {
    q: "What are your opening hours?",
    a: "We're open 5:00 AM to 11:00 PM on weekdays and 7:00 AM to 9:00 PM on weekends, so you can train on your schedule.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="Forging Champions Since 2013"
        description="Royal Fitness was founded on a simple belief: everyone deserves elite coaching in an environment that inspires greatness."
      />

      {/* Story */}
      <section className="pb-8">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal variant="right">
            <ImageReveal
              src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=70"
              alt="Inside the Royal Fitness club"
              width={720}
              height={560}
              className="aspect-[4/3] rounded-3xl border border-white/10"
            />
          </Reveal>
          <div>
            <SectionTitle
              align="left"
              eyebrow="The Mission"
              title="More Than a Gym"
              description="What began as a single strength studio has grown into a full-scale performance club — without ever losing the personal, coach-first approach that defines us."
              animateTitle={false}
            />
            <p className="mt-6 text-muted-foreground">
              We combine science-backed programming with a genuinely premium
              environment. Our coaches take the time to understand your goals,
              your lifestyle, and your limits — then build a path that gets you
              results and keeps you coming back.
            </p>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="section-py">
        <Container>
          <StaggerGroup className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <GlassCard className="text-center">
                  <div className="font-heading text-4xl text-royal-gradient md:text-5xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* Values */}
      <section className="section-py pt-0">
        <Container>
          <SectionTitle
            eyebrow="What We Stand For"
            title="Our Core Values"
          />
          <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <GlassCard glow className="h-full">
                  <span className="grid size-12 place-items-center rounded-xl bg-royal/15 text-royal">
                    <v.icon className="size-6" />
                  </span>
                  <h3 className="mt-4 font-heading text-xl tracking-wide">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-py pt-0">
        <Container className="max-w-3xl">
          <SectionTitle eyebrow="FAQ" title="Questions & Answers" />
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
