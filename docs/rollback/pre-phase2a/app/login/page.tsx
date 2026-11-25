import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Sign in — Flurzi Cinema", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <AuthPlaceholder
      eyebrow="AUTH · SIGN IN"
      title="Welcome back."
      description="Sign in to continue your Flurzi Cinema experience. Uses AuthenticationService from lib/api/services.ts — production backend pending."
    />
  );
}
