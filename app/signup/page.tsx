import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { SignUpForm } from "@/components/forms/signup-form";

export const metadata: Metadata = buildMetadata({
  title: "Sign Up",
  description: "Create an account with Royal Fitness to join the premium luxury gym, reserve training slots, and view custom diet plans.",
  path: "/signup",
});

export default function SignUpPage() {
  return (
    <>
      <PageHeader
        eyebrow="Elite Membership"
        title="Begin Your Journey"
        description="Join the club of elite performance. Register to access personalized training programs and membership benefits."
      />

      <section className="pb-24">
        <Container>
          <SignUpForm />
        </Container>
      </section>
    </>
  );
}
