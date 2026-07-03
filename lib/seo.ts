import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const SITE_NAME = "Royal Fitness";
export const SITE_TAGLINE = "Train Like Royalty";
export const SITE_DESCRIPTION =
  "Royal Fitness is Wagholi, Pune's community-driven gym — training warriors since 2017. Weight training, cardio, CrossFit, Zumba, yoga, functional training and expert personal coaching.";

/**
 * Build page metadata with sensible OpenGraph / Twitter defaults.
 * Every page should call this instead of hand-rolling metadata objects.
 */
export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image,
}: {
  title?: string;
  description?: string;
  path?: string;
  /** Optional override; when omitted the generated opengraph-image is used. */
  image?: string;
} = {}): Metadata {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const url = `${SITE_URL}${path}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      // If `image` is omitted, Next merges the app/opengraph-image route.
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/** JSON-LD structured data for the gym (LocalBusiness / HealthClub). */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: "+91-97300-91331",
    image: `${SITE_URL}/og.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "1st Floor, ICON Imperio, IVY ESTATE, above Reliance Smart Point, Wagholi",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      postalCode: "412207",
      addressCountry: "IN",
    },
    openingHours: ["Mo-Sa 05:00-22:00", "Su 17:00-21:30"],
    priceRange: "₹₹",
  };
}
