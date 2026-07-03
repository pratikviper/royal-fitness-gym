"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Expand } from "lucide-react";
import { galleryImages, galleryCategories } from "@/data/gallery";
import type { GalleryCategory } from "@/types";
import { Lightbox } from "@/components/gallery/lightbox";
import { cn } from "@/lib/utils";

type Filter = GalleryCategory | "All";

/**
 * Masonry gallery (CSS columns) with category filters, hover effects, lazy
 * loading (next/image) and a keyboard-navigable lightbox.
 */
export function GalleryGrid() {
  const [filter, setFilter] = useState<Filter>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? galleryImages
        : galleryImages.filter((img) => img.category === filter),
    [filter],
  );

  return (
    <div>
      {/* Filters */}
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {galleryCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              "relative rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors",
              filter === cat
                ? "border-royal text-white"
                : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
          >
            {filter === cat && (
              <motion.span
                layoutId="gallery-filter"
                className="absolute inset-0 -z-10 rounded-full bg-royal/20"
              />
            )}
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry via CSS columns */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((img, i) => (
          <motion.button
            layout
            key={img.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            onClick={() => setLightboxIndex(i)}
            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-white/10"
            aria-label={`View ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={800}
              height={
                img.span === "tall" ? 900 : img.span === "wide" ? 470 : 600
              }
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/90 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="flex w-full items-center justify-between p-4">
                <span className="text-sm font-medium text-white">
                  {img.category}
                </span>
                <span className="grid size-9 place-items-center rounded-full bg-royal text-white">
                  <Expand className="size-4" />
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <Lightbox
        images={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
