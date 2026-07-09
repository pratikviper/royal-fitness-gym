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

  return (
    <>
      {!isAdmin && (
        <>
          <ScrollProgressBar />
          <Navbar />
        </>
      )}

      <main>{children}</main>

      {!isAdmin && (
        <>
          <Footer />
          <WhatsAppButton />
        </>
      )}
    </>
  );
}