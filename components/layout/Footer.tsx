import { Brand } from "./Header";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer wrap">
      <div className="footer-top">
        <Link href="/" aria-label="Flurzi Cinema home">
          <Brand />
        </Link>
        <p>Movies. TV series. Flurzi Cinema.</p>
        <Link className="text-link" href="/">
          Back to the beginning
        </Link>
      </div>
      <div className="footer-columns">
        <div className="footer-description">
          <p>
            A movie and TV streaming platform in development.
            <br />Explore the public preview. Streaming is not available yet.
          </p>
          <span className="label">SOCIAL CHANNELS · COMING LATER</span>
        </div>
        <div>
          <h3>Discover</h3>
          <Link href="/explore">Explore</Link><Link href="/movies">Movies</Link><Link href="/series">Series</Link><Link href="/originals">Originals & exclusives</Link><Link href="/premieres">Premieres & coming soon</Link>
        </div>
        <div>
          <h3>Flurzi Cinema</h3>
          <Link href="/about">About the concept</Link><Link href="/features">The experience</Link><Link href="/pricing">Membership</Link><Link href="/help">Help center</Link><Link href="/contact">Contact</Link>
        </div>
        <div>
          <h3>The details</h3>
          <Link href="/legal/privacy">Privacy draft</Link><Link href="/legal/terms">Terms draft</Link><Link href="/legal/cookies">Cookies draft</Link><Link href="/legal/copyright">Copyright & content</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Flurzi Cinema. Concept preview.
        </span>
        <span>Fictional films. Real love for cinema.</span>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        flurzi<span>✳</span>
      </div>
    </footer>
  );
}
