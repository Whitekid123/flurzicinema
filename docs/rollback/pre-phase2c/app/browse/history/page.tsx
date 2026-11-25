import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "History — Flurzi Cinema", robots: { index: false, follow: false } };

export default function HistoryPage() {
  return (
    <RoutePlaceholder
      eyebrow="STREAMING · VIEWING HISTORY"
      title="History."
      description="Viewing history scaffold. Data: CatalogService.getViewingHistory + ViewingProgress. Continue Watching lives on /browse."
    />
  );
}
