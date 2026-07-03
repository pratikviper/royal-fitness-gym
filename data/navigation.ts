import type { NavItem } from "@/types";

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Membership", href: "/membership" },
  { label: "Trainers", href: "/trainers" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

/** Footer link groups. */
export const footerNav = [
  {
    title: "Explore",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Membership", href: "/membership" },
      { label: "Trainers", href: "/trainers" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/about#faq" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
] satisfies { title: string; links: NavItem[] }[];
