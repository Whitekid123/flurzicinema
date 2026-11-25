import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "New profile — Flurzi Cinema", robots: { index: false, follow: false } };

export default function NewProfilePage() {
  return (
    <RoutePlaceholder
      eyebrow="ONBOARDING · CREATE PROFILE"
      title="Create a profile."
      description="Create profile scaffold. Data: ProfileService.createProfile(CreateProfileRequest). PIN is optional and backend-hashed — never stored client-side."
    />
  );
}
