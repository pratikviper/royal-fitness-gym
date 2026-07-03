"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";

/** Floating WhatsApp CTA, fixed to the bottom-right on every page. */
export function WhatsAppButton() {
  const href = whatsappLink(
    WHATSAPP_NUMBER,
    "Hi Royal Fitness! I'd like to know more about your memberships.",
  );

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
      <MessageCircle className="relative size-7" />
    </motion.a>
  );
}
