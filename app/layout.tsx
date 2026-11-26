import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/lib/state/SessionContext";
import "@/styles/brand-tokens.css";
import "@/styles/globals.css";
import "@/styles/exhibition.css";
import "@/styles/integration.css";
import "@/styles/editorial.css";
import "@/styles/editorial-sections.css";
import "@/styles/motion-followup.css";
import "@/styles/streaming-entry.css";
import "@/styles/streaming-browse.css";
import "@/styles/streaming-discovery.css";
import "@/styles/interaction-corrections.css";
import "@/styles/brand-components.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Flurzi Cinema — Movies & TV Streaming",
  description:
    "Discover movies and TV series with Flurzi Cinema. Find your next story and explore a viewing experience that starts with you.",
  applicationName: "Flurzi Cinema",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Flurzi Cinema — Movies & TV Streaming",
    description:
      "Explore movies, TV series and your next shared movie night with Flurzi Cinema.",
    type: "website",
    images: [
      {
        url: "/brand/flurzi-cinema-official.jpg",
        width: 1254,
        height: 1254,
        alt: "Official Flurzi Cinema brand artwork",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flurzi Cinema — Movies & TV Streaming",
    images: ["/brand/flurzi-cinema-official.jpg"],
  },
};
export const viewport: Viewport = { themeColor: "#08090B" };
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
