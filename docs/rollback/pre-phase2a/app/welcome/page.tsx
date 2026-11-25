import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Welcome — Flurzi Cinema", robots: { index: false, follow: false } };

export default function WelcomePage() {
  return (
    <RoutePlaceholder
      eyebrow="ONBOARDING · WELCOME"
      title="Welcome to Flurzi Cinema."
      description="Post-registration welcome scaffold. Next step: /subscribe, then /profiles."
    />
  );
}
