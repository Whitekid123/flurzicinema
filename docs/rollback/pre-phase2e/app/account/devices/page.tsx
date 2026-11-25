import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Devices — Flurzi Cinema", robots: { index: false, follow: false } };

export default function DevicesPage() {
  return (
    <RoutePlaceholder
      eyebrow="ACCOUNT · DEVICES"
      title="Devices."
      description="Device management scaffold. Data: SubscriptionService.listDevices / revokeDevice (DeviceInfo)."
    />
  );
}
