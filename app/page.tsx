import { Hero } from "@/components/hero/hero";
import { Marquee } from "@/components/shared/marquee";
import { AboutPreview } from "@/sections/about-preview";
import { MembershipPreview } from "@/sections/membership-preview";
import { TrainerPreview } from "@/sections/trainer-preview";
import { TransformationGallery } from "@/sections/transformation-gallery";
import { Facilities } from "@/sections/facilities";
import { TestimonialsSection } from "@/sections/testimonials-section";
import { BmiSection } from "@/sections/bmi-section";
import { CtaBanner } from "@/sections/cta-banner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <Marquee
        items={["Strength", "Discipline", "Power", "Royalty", "Endurance", "Elite"]}
      />
      <MembershipPreview />
      <TrainerPreview />
      <TransformationGallery />
      <Facilities />
      <TestimonialsSection />
      <BmiSection />
      <CtaBanner />
    </>
  );
}
