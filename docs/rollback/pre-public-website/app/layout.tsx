import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import "@/styles/exhibition.css";
import "@/styles/integration.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Flurzi Cinema — Beyond watching",
  description:
    "Discover extraordinary stories. Explore the Flurzi Cinema public concept: a new perspective on cinema, discovery and watching together.",
  applicationName: "Flurzi Cinema",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Flurzi Cinema — Beyond watching",
    description:
      "A new perspective on cinema. Explore the public frontend preview.",
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
    title: "Flurzi Cinema — Beyond watching",
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
      <body>{children}</body>
    </html>
  );
}
