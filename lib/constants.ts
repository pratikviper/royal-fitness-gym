/** App-wide constants sourced from env with safe fallbacks. */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://royalfitness.com";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919730091331";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@royalfitness.com";

export const GOOGLE_MAPS_EMBED_URL =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ??
  // Keyless embed pointed at the studio (ICON Imperio, Wagholi, Pune).
  "https://maps.google.com/maps?q=ICON%20Imperio%2C%20Ivy%20Estate%2C%20Wagholi%2C%20Pune%2C%20Maharashtra%20412207&t=&z=15&ie=UTF8&iwloc=&output=embed";
