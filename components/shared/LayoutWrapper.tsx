"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { ScrollProgressBar } from "@/components/shared/scroll-progress-bar";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  // The admin section renders its own <main> inside its dashboard shell, so
  // wrapping it again here would nest landmarks and produce invalid HTML.
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <ScrollProgressBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}