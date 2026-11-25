import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/streaming/RoutePlaceholder";

export const metadata: Metadata = { title: "Set new password — Flurzi Cinema", robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return (
    <AuthPlaceholder
      eyebrow="AUTH · SET NEW PASSWORD"
      title="Set a new password."
      description="Scaffold for AuthenticationService.resetPassword. Expects a single-use token from the backend — never invent a reset flow client-side."
    />
  );
}
