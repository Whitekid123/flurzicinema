import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Choose plan — Flurzi Cinema", robots: { index: false, follow: false } };

export default function SubscribePage() {
  return (
    <RoutePlaceholder
      eyebrow="ONBOARDING · SUBSCRIBE"
      title="Choose your plan."
      description="Plan selection scaffold. Data: SubscriptionService.listPlans / getEntitlement. Distinct from the public /pricing preview (PlanPreview)."
    />
  );
}
