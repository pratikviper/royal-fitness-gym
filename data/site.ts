import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/lib/constants";

/** Single source of truth for site-level info (footer, contact, schema). */
export const siteConfig = {
  name: "Royal Fitness",
  tagline: "Train Like Royalty",
  description:
    "A premium, elite training club with world-class coaches and luxury facilities.",
  email: CONTACT_EMAIL,
  phone: "+91 97300 91331",
  whatsapp: WHATSAPP_NUMBER,
  address:
    "1st Floor, ICON Imperio, IVY ESTATE, above Reliance Smart Point, Wagholi, Pune, Maharashtra 412207, India",
  hours: [
    { day: "Monday – Friday", time: "5:00 AM – 11:00 PM" },
    { day: "Saturday", time: "7:00 AM – 9:00 PM" },
    { day: "Sunday", time: "7:00 AM – 9:00 PM" },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com", icon: "Instagram" },
    { label: "Facebook", href: "https://facebook.com", icon: "Facebook" },
    { label: "Twitter", href: "https://twitter.com", icon: "Twitter" },
    { label: "Youtube", href: "https://youtube.com", icon: "Youtube" },
  ],
} as const;
