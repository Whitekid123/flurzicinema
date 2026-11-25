import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Billing — Flurzi Cinema", robots: { index: false, follow: false } };

export default function BillingPage() {
  return (
    <RoutePlaceholder
      eyebrow="ACCOUNT · BILLING"
      title="Billing."
      description="Billing scaffold. Data: SubscriptionService.getBillingHistory / changePlan / cancelSubscription. No real payment processing in frontend."
    />
  );
}
