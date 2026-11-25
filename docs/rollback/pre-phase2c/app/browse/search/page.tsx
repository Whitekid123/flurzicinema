import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Search — Flurzi Cinema", robots: { index: false, follow: false } };

export default function BrowseSearchPage() {
  return (
    <RoutePlaceholder
      eyebrow="STREAMING · SEARCH"
      title="Search."
      description="Authenticated search and filter scaffold. Data: CatalogService.search + listGenres. Search state stays local to this route."
    />
  );
}
