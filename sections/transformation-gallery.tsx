import { Container } from "@/components/shared/container";
import { SectionTitle } from "@/components/shared/section-title";
import { AnimatedButton } from "@/components/shared/animated-button";
import { ImageReveal } from "@/components/shared/image-reveal";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { galleryImages } from "@/data/gallery";

/** A curated preview strip of the full gallery on the home page. */
export function TransformationGallery() {
  const preview = galleryImages.slice(0, 6);

  return (
    <section className="section-py">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionTitle
            align="left"
            eyebrow="Gallery"
            title="Real Effort. Real Results."
            description="Step inside the club and see the energy, the equipment, and the transformations."
          />
          <div className="shrink-0">
            <AnimatedButton href="/gallery" variant="outline" shine={false}>
              Open Full Gallery
            </AnimatedButton>
          </div>
        </div>

        <StaggerGroup className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {preview.map((img, i) => (
            <StaggerItem
              key={img.id}
              className={i === 0 ? "col-span-2 row-span-2 md:col-span-1" : ""}
            >
              <ImageReveal
                src={img.src}
                alt={img.alt}
                width={600}
                height={600}
                className="aspect-square rounded-2xl border border-white/10"
                imgClassName="transition-transform duration-700 hover:scale-105"
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
