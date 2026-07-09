import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata: Metadata = buildMetadata({
  title: "Profile",
  description: "View your premium membership status, check BMI composition, calculate logs, and update credentials at Royal Fitness.",
  path: "/profile",
});

export default function ProfilePage() {
  return <ProfileClient />;
}
