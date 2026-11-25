import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Create account — Flurzi Cinema", robots: { index: false, follow: false } };

export default function SignupPage() {
  return (
    <AuthPlaceholder
      eyebrow="AUTH · CREATE ACCOUNT"
      title="Create your account."
      description="Registration scaffold using RegisterRequest / AuthenticationService.register. Email verification is required before streaming."
    />
  );
}
