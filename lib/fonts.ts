import { Bebas_Neue, Inter } from "next/font/google";

/** Display / heading face — condensed, bold, athletic. */
export const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
  display: "swap",
});

/** Body face — highly legible at all sizes. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
