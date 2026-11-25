"use client";
// Streaming app shell — separate from the public site header/footer.
// Client component because it highlights the active nav item by pathname.
// Codex owns final visual design; this is structural only.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/layout/Header";

const links: [string, string][] = [
  ["Home", "/browse"],
  ["Movies", "/browse/movies"],
  ["Series", "/browse/series"],
  ["Search", "/browse/search"],
  ["My List", "/browse/my-list"],
  ["Account", "/account"],
];

export function StreamingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="streaming-app">
      <header className="header">
        <Link href="/browse" aria-label="Flurzi Cinema home">
          <Brand />
        </Link>
        <nav className="desktop-nav" aria-label="Streaming navigation">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main" style={{ paddingTop: "88px" }}>
        {children}
      </main>
    </div>
  );
}
