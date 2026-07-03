import { Container } from "@/components/shared/container";
import { SectionTitle } from "@/components/shared/section-title";
import { TestimonialCarousel } from "@/components/testimonial/testimonial-carousel";

export function TestimonialsSection() {
  return (
    <section className="section-py relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <Container className="relative">
        <SectionTitle
          eyebrow="Testimonials"
          title="Trusted By Our Members"
          description="Thousands of transformations. Here's what our community has to say."
        />
        <div className="mt-14">
          <TestimonialCarousel />
        </div>
      </Container>
    </section>
  );
}
