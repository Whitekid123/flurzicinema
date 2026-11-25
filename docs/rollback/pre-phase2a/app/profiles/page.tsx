import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Choose profile — Flurzi Cinema", robots: { index: false, follow: false } };

export default function ProfilesPage() {
  return (
    <RoutePlaceholder
      eyebrow="ONBOARDING · CHOOSE PROFILE"
      title="Who's watching?"
      description="Profile selection scaffold. Data: ProfileService.listProfiles / selectProfile. Includes kids profiles and optional PIN (ProfileService.verifyPin)."
    />
  );
}
