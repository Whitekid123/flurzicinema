import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Account — Flurzi Cinema", robots: { index: false, follow: false } };

export default function AccountPage() {
  return (
    <RoutePlaceholder
      eyebrow="ACCOUNT · OVERVIEW"
      title="Account."
      description="Account overview scaffold. Data: AuthenticationService.getAccount + SubscriptionService.getSubscription / getEntitlement."
    />
  );
}
