import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/lib/constants";

/** Single source of truth for site-level info (footer, contact, schema). */
export const siteConfig = {
  name: "Royal Fitness",
  tagline: "Train Like Royalty",
  description:
    "A community-driven fitness hub in Wagholi, Pune — training warriors since 2017.",
  email: CONTACT_EMAIL,
  phone: "+91 97300 91331",
  phoneAlt: "+91 86691 08946",
  whatsapp: WHATSAPP_NUMBER,
  address:
    "1st Floor, ICON Imperio, IVY ESTATE, above Reliance Smart Point, Wagholi, Pune, Maharashtra 412207, India",
  hours: [
    { day: "Monday – Saturday", time: "5:00 AM – 10:00 PM" },
    { day: "Sunday", time: "5:00 PM – 9:30 PM" },
    { day: "Every 3rd Sunday", time: "Closed (Inspection)" },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com", icon: "Instagram" },
    { label: "Facebook", href: "https://facebook.com", icon: "Facebook" },
    { label: "Twitter", href: "https://twitter.com", icon: "Twitter" },
    { label: "Youtube", href: "https://youtube.com", icon: "Youtube" },
  ],
} as const;
