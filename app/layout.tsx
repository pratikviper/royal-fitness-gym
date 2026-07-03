import type { Metadata, Viewport } from "next";
import "./globals.css";
import { bebasNeue, inter } from "@/lib/fonts";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { Providers } from "@/components/shared/providers";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { ScrollProgressBar } from "@/components/shared/scroll-progress-bar";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata(),
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased">
        {/* Structured data for rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />

        <Providers>
          <ScrollProgressBar />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
