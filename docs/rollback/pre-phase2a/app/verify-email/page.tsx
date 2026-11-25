import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Verify email — Flurzi Cinema", robots: { index: false, follow: false } };

export default function VerifyEmailPage() {
  return (
    <AuthPlaceholder
      eyebrow="AUTH · EMAIL VERIFICATION"
      title="Verify your email."
      description="Scaffold for AuthenticationService.verifyEmail / resendVerificationEmail. Streaming stays gated until the backend confirms verification."
    />
  );
}
