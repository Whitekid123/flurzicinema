import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Watch — Flurzi Cinema", robots: { index: false, follow: false } };

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RoutePlaceholder
      eyebrow="STREAMING · PLAYER"
      title={`Watch ${id}`}
      description="Video player scaffold. Data: PlaybackService.getPlaybackMetadata (short-lived, server-authorised manifest only in production). Progress: PlaybackService.reportProgress."
    />
  );
}
