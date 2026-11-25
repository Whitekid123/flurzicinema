"use client";
// Frontend route guard — UX convenience only, NOT a security boundary.
// The backend must enforce sessions/permissions on every API call.
// Production: replace mock check with server session validation.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/state/SessionContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { auth } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "unauthenticated" || auth.status === "session-expired") {
      router.replace("/login");
    }
  }, [auth.status, router]);

  if (auth.status === "authenticating") {
    return (
      <div className="wrap section-space">
        <p className="eyebrow">FLURZI CINEMA</p>
        <p>Checking your session…</p>
      </div>
    );
  }
  if (auth.status === "unauthenticated" || auth.status === "session-expired") {
    return null;
  }
  if (auth.status === "email-verification-required") {
    return (
      <div className="wrap section-space">
        <p className="eyebrow">VERIFY EMAIL</p>
        <h2>Please verify your email.</h2>
        <p style={{ marginTop: "1rem" }}>We sent a verification link before streaming can start.</p>
      </div>
    );
  }
  if (auth.status === "service-unavailable") {
    return (
      <div className="wrap section-space">
        <p className="eyebrow">UNAVAILABLE</p>
        <h2>Service unavailable.</h2>
        <p style={{ marginTop: "1rem" }}>Please try again in a moment.</p>
      </div>
    );
  }
  return <>{children}</>;
}
