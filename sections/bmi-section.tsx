import { Container } from "@/components/shared/container";
import { SectionTitle } from "@/components/shared/section-title";
import { BmiCalculator } from "@/components/forms/bmi-calculator";

export function BmiSection() {
  return (
    <section id="bmi" className="section-py">
      <Container>
        <SectionTitle
          eyebrow="Know Your Numbers"
          title="BMI Calculator"
          description="A quick snapshot of where you stand — then let our coaches build the plan to get you where you want to be."
        />
        <div className="mt-14">
          <BmiCalculator />
        </div>
      </Container>
    </section>
  );
}
