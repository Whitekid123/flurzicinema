"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";

const links = [
  ["Home", "#home"],
  ["Explore", "#explore"],
  ["Movies", "#vault"],
  ["Series", "#series"],
  ["Features", "#features"],
  ["Pricing", "#membership"],
];
export function Brand() {
  return (
    <span className="brand">
      flurzi<span className="brand-star">✳</span>
      <span className="brand-sub">CINEMA</span>
    </span>
  );
}
export function Header({ onSignIn }: { onSignIn: () => void }) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive("#" + entry.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    for (const [, href] of links) {
      const node = document.querySelector(href);
      if (node) observer.observe(node);
    }
    return () => {
      window.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#home" aria-label="Flurzi Cinema home">
          <Brand />
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              aria-current={active === href ? "location" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="signin" onClick={onSignIn}>
            Sign In
          </button>
          <a className="button button-small" href="#membership">
            Get Started
          </a>
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
              <a key={label} href={href} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
            <button
              onClick={() => {
                setMenu(false);
                onSignIn();
              }}
            >
              Sign In
            </button>
          </nav>
        </Modal>
      )}
    </>
  );
}
