import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Security — Flurzi Cinema", robots: { index: false, follow: false } };

export default function SecurityPage() {
  return (
    <RoutePlaceholder
      eyebrow="ACCOUNT · SECURITY"
      title="Security."
      description="Security settings scaffold. Password change and session controls must be backend-enforced; frontend only calls AuthenticationService."
    />
  );
}
