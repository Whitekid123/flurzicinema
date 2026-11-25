import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Forgot password — Flurzi Cinema", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthPlaceholder
      eyebrow="AUTH · PASSWORD RECOVERY"
      title="Reset your password."
      description="Scaffold for AuthenticationService.requestPasswordRecovery. No password is stored or transmitted by this placeholder."
    />
  );
}
