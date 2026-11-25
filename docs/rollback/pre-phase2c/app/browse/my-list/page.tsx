import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "My List — Flurzi Cinema", robots: { index: false, follow: false } };

export default function MyListPage() {
  return (
    <RoutePlaceholder
      eyebrow="STREAMING · MY LIST"
      title="My List."
      description="Watchlist scaffold per ViewerProfile. Data: WatchlistService. Distinct from the public-site localStorage saved-demo (lib/useSavedStories)."
    />
  );
}
