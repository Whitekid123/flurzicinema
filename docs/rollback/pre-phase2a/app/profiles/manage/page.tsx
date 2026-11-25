import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Manage profiles — Flurzi Cinema", robots: { index: false, follow: false } };

export default function ManageProfilesPage() {
  return (
    <RoutePlaceholder
      eyebrow="ONBOARDING · MANAGE PROFILES"
      title="Manage profiles."
      description="Edit/delete profile scaffold. Data: ProfileService.updateProfile / deleteProfile. Profile preferences: ProfilePreferences."
    />
  );
}
