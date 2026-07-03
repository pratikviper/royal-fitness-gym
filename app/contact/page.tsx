import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { ContactForm } from "@/components/forms/contact-form";
import { GlassCard } from "@/components/shared/glass-card";
import { siteConfig } from "@/data/site";
import { GOOGLE_MAPS_EMBED_URL } from "@/lib/constants";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with Royal Fitness — book a free trial, ask about membership, or visit our flagship club.",
  path: "/contact",
});

export default function ContactPage() {
  const whatsapp = whatsappLink(
    siteConfig.whatsapp,
    "Hi Royal Fitness! I'd like to book a trial session.",
  );

  return (
    <>
      <PageHeader
        eyebrow="Get In Touch"
        title="Let's Start Your Journey"
        description="Questions about membership, coaching, or a free trial? Our team is ready to help."
      />

      <section className="pb-24">
        <Container className="grid gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <Reveal variant="up">
              <ContactForm />
            </Reveal>
          </div>

          {/* Info */}
          <div className="space-y-4 lg:col-span-2">
            <Reveal variant="left">
              <GlassCard className="space-y-5">
                <InfoRow icon={MapPin} label="Address" value={siteConfig.address} />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={`${siteConfig.phone}  ·  ${siteConfig.phoneAlt}`}
                  href={`tel:${siteConfig.phone}`}
                />
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={siteConfig.email}
                  href={`mailto:${siteConfig.email}`}
                />
                <InfoRow
                  icon={MessageCircle}
                  label="WhatsApp"
                  value="Chat with us"
                  href={whatsapp}
                />
              </GlassCard>
            </Reveal>

            <Reveal variant="left" delay={0.1}>
              <GlassCard>
                <div className="mb-4 flex items-center gap-2 text-royal">
                  <Clock className="size-5" />
                  <h3 className="font-heading text-xl tracking-wide">
                    Working Hours
                  </h3>
                </div>
                <ul className="space-y-2 text-sm">
                  {siteConfig.hours.map((h) => (
                    <li
                      key={h.day}
                      className="flex justify-between border-b border-white/5 pb-2 text-muted-foreground last:border-0"
                    >
                      <span>{h.day}</span>
                      <span className="text-foreground">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </Reveal>
          </div>
        </Container>

        {/* Map */}
        <Container className="mt-10">
          <Reveal variant="up">
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <iframe
                title="Royal Fitness location"
                src={GOOGLE_MAPS_EMBED_URL}
                width="100%"
                height="420"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale invert-[0.92] contrast-[0.9]"
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-royal/15 text-royal">
        <Icon className="size-5" />
      </span>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 text-foreground">{value}</div>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="block transition-opacity hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
}
