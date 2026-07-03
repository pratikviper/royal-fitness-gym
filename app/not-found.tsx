import Link from "next/link";
import { Container } from "@/components/shared/container";
import { AnimatedButton } from "@/components/shared/animated-button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-royal/20 blur-[120px]" />

      <Container className="relative text-center">
        <h1 className="font-heading text-[7rem] leading-none text-royal-gradient sm:text-[12rem]">
          404
        </h1>
        <h2 className="mt-2 text-3xl text-metallic sm:text-4xl">
          This Rep Doesn&apos;t Exist
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          The page you&apos;re looking for has left the building. Let&apos;s get
          you back to training.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <AnimatedButton href="/">Back to Home</AnimatedButton>
          <Link
            href="/membership"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-royal hover:underline"
          >
            View Memberships
          </Link>
        </div>
      </Container>
    </section>
  );
}
