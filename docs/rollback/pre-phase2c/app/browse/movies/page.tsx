import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Movies — Browse · Flurzi Cinema", robots: { index: false, follow: false } };

export default function BrowseMoviesPage() {
  return (
    <RoutePlaceholder
      eyebrow="STREAMING · MOVIES"
      title="Movies."
      description="Authenticated movies catalog. Data: CatalogService.listTitles({ mediaType: 'movie' }). Distinct from the public /movies preview page."
    />
  );
}
