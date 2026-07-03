import Link from "next/link";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { NewsletterForm } from "@/components/footer/newsletter-form";
import { footerNav } from "@/data/navigation";
import { siteConfig } from "@/data/site";

const socialIcons: Record<string, LucideIcon> = {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink-soft">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-royal/60 to-transparent" />

      <Container className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand + newsletter */}
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-5 max-w-sm text-sm text-muted-foreground">
            {siteConfig.description} Join a community built on discipline,
            excellence, and results.
          </p>

          <div className="mt-6 max-w-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-silver">
              Join the newsletter
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Link groups */}
        {footerNav.map((group) => (
          <div key={group.title}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-silver">
              {group.title}
            </h3>
            <ul className="space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-royal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-silver">
            Visit Us
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-royal" />
              {siteConfig.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-royal" />
              <span className="flex flex-wrap gap-x-2">
                <a href={`tel:${siteConfig.phone}`} className="hover:text-royal">
                  {siteConfig.phone}
                </a>
                <span className="text-white/20">·</span>
                <a
                  href={`tel:${siteConfig.phoneAlt}`}
                  className="hover:text-royal"
                >
                  {siteConfig.phoneAlt}
                </a>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-royal" />
              <a
                href={`mailto:${siteConfig.email}`}
                className="hover:text-royal"
              >
                {siteConfig.email}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {siteConfig.socials.map((social) => {
              const Icon = socialIcons[social.icon];
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="grid size-10 place-items-center rounded-full border border-white/10 text-muted-foreground transition-all hover:border-royal hover:text-royal"
                >
                  {Icon && <Icon className="size-4" />}
                </a>
              );
            })}
          </div>
        </Container>
      </div>
    </footer>
  );
}
