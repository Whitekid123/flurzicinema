// Neutral scaffold components for Codex to replace with final UI.
// Deliberately unstyled beyond existing site classes (wrap, eyebrow,
// section-space). No animations, no final visual design.
import Link from "next/link";

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  mockNote = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  mockNote?: boolean;
}) {
  return (
    <div className="wrap section-space">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p style={{ maxWidth: "60ch", marginTop: "1rem" }}>{description}</p>
      {mockNote ? (
        <p className="subtle" style={{ marginTop: "1rem" }}>
          Scaffold only — development mock, not connected to a production
          backend. Codex: replace this placeholder with the final interface.
        </p>
      ) : null}
    </div>
  );
}

export function AuthPlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="wrap section-space">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p style={{ maxWidth: "60ch", marginTop: "1rem" }}>{description}</p>
      <p className="subtle" style={{ marginTop: "1rem" }}>
        Auth scaffold — forms are placeholders. No credentials are collected,
        stored or sent. Production authentication is owned by the backend
        engineer.
      </p>
      <p style={{ marginTop: "1.5rem" }}>
        <Link className="text-link" href="/">
          Back to public site
        </Link>
      </p>
    </div>
  );
}
