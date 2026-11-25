import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Browse — Flurzi Cinema", robots: { index: false, follow: false } };

export default function BrowseHomePage() {
  return (
    <RoutePlaceholder
      eyebrow="STREAMING · HOME"
      title="Your home."
      description="Personalised homepage scaffold. Data: RecommendationService.getHomeRails + CatalogService.getContinueWatching for the active ViewerProfile. Dev mock in lib/api/mocks."
    />
  );
}
