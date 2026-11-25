import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Title — Flurzi Cinema", robots: { index: false, follow: false } };

export default async function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RoutePlaceholder
      eyebrow="STREAMING · TITLE DETAILS"
      title={`Title ${id}`}
      description="Authenticated title detail scaffold: Movie/Series with seasons, episodes, availability and PlaybackService entry. Data: CatalogService.getTitle(id)."
    />
  );
}
