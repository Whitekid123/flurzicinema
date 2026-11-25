import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Series — Browse · Flurzi Cinema", robots: { index: false, follow: false } };

export default function BrowseSeriesPage() {
  return (
    <RoutePlaceholder
      eyebrow="STREAMING · SERIES"
      title="Series."
      description="Authenticated series catalog with seasons/episodes. Data: CatalogService.listTitles({ mediaType: 'series' }). Distinct from the public /series preview page."
    />
  );
}
