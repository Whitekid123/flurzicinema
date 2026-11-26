"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandWordmark } from "@/components/ui/BrandWordmark";
import { Modal } from "@/components/ui/Modal";

const links = [
  ["Home", "/"],
  ["Explore", "/explore"],
  ["Movies", "/movies"],
  ["Series", "/series"],
  ["Features", "/features"],
  ["Pricing", "/pricing"],
];
export function Brand() {
  return (
    <span className="brand"><BrandWordmark/></span>
  );
}
export function Header({ onSignIn }: { onSignIn?: () => void }) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
    };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
        <Link href="/" aria-label="Flurzi Cinema home">
          <Brand />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              aria-current={(href === "/" ? pathname === "/" : pathname.startsWith(href)) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {onSignIn ? <button className="signin" onClick={onSignIn}>
            Sign In
          </button> : <Link className="signin" href="/sign-in">Sign In</Link>}
          <Link className="button button-small" href="/get-started">
            Get Started
          </Link>
          <button
            className="menu-toggle"
            onClick={() => setMenu(true)}
            aria-expanded={menu}
            aria-label="Open navigation"
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      {menu && (
        <Modal title="Navigation" onClose={() => setMenu(false)}>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {links.map(([label, href]) => (
              <Link key={label} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setMenu(false)}>
                {label}
              </Link>
            ))}
            {onSignIn ? <button
              onClick={() => {
                setMenu(false);
                onSignIn();
              }}
            >
              Sign In
            </button> : <Link href="/sign-in" onClick={() => setMenu(false)}>Sign In</Link>}
          </nav>
        </Modal>
      )}
    </>
  );
}
