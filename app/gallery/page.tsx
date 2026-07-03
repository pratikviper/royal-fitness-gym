import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export const metadata: Metadata = buildMetadata({
  title: "Gallery",
  description:
    "Step inside Royal Fitness — explore our facilities, classes, strength floor, and member transformations.",
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Inside The Club"
        description="A glimpse of the energy, equipment, and results that define Royal Fitness."
      />

      <section className="pb-24">
        <Container>
          <GalleryGrid />
        </Container>
      </section>
    </>
  );
}
