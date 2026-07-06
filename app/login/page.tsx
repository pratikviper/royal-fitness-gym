import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = buildMetadata({
  title: "Login",
  description: "Log in to your Royal Fitness account to track workouts, access premium plans, and view schedules.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portal Access"
        title="Welcome Back"
        description="Access the elite training dashboard and manage your custom fitness schedule."
      />

      <section className="pb-24">
        <Container>
          <LoginForm />
        </Container>
      </section>
    </>
  );
}
