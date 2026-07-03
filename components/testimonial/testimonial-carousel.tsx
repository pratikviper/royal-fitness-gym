"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { cn } from "@/lib/utils";

/** Embla-powered testimonial carousel with dots + arrow controls. */
export function TestimonialCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="min-w-0 flex-[0_0_100%] px-3 md:flex-[0_0_60%]"
            >
              <figure className="glass mx-auto flex h-full max-w-2xl flex-col rounded-2xl p-8 md:p-10">
                <Quote className="size-10 text-royal/60" />
                <blockquote className="mt-5 text-lg leading-relaxed text-foreground/90 md:text-xl">
                  “{t.quote}”
                </blockquote>

                <div className="mt-6 flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-royal text-royal"
                    />
                  ))}
                </div>

                <figcaption className="mt-6 flex items-center gap-4 border-t border-white/10 pt-6">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={52}
                    height={52}
                    className="size-[52px] rounded-full border border-white/10 object-cover"
                  />
                  <div>
                    <div className="font-heading text-lg tracking-wide text-metallic">
                      {t.name}
                    </div>
                    <div className="text-sm text-royal">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={scrollPrev}
          className="grid size-11 place-items-center rounded-full border border-white/10 text-foreground transition-colors hover:border-royal hover:text-royal"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                selected === i ? "w-6 bg-royal" : "w-2 bg-white/20",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Next testimonial"
          onClick={scrollNext}
          className="grid size-11 place-items-center rounded-full border border-white/10 text-foreground transition-colors hover:border-royal hover:text-royal"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
