import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/lib/state/SessionContext";
import "@/styles/globals.css";
import "@/styles/exhibition.css";
import "@/styles/integration.css";
import "@/styles/editorial.css";
import "@/styles/editorial-sections.css";
import "@/styles/motion-followup.css";
import "@/styles/streaming-entry.css";
import "@/styles/streaming-browse.css";
import "@/styles/streaming-discovery.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Flurzi Cinema — Movies & TV Streaming",
  description:
    "Discover movies and TV series with Flurzi Cinema, a streaming platform in development. Explore the public preview; streaming is not available yet.",
  applicationName: "Flurzi Cinema",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Flurzi Cinema — Movies & TV Streaming",
    description:
      "Explore movies, TV series and planned streaming features in the Flurzi Cinema public preview. Streaming is not available yet.",
    type: "website",
    images: [
      {
        url: "/images/quiet-beyond.webp",
        width: 1536,
        height: 1024,
        alt: "Original artwork for the fictional film The Quiet Beyond",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flurzi Cinema — Movies & TV Streaming",
    images: ["/images/quiet-beyond.webp"],
  },
};
export const viewport: Viewport = { themeColor: "#0B1018" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><SessionProvider>{children}</SessionProvider></body>
    </html>
  );
}
