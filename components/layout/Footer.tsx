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
            Movies and series, thoughtfully brought together.
            <br />Explore the collection. Check each title for availability.
          </p>
          <span className="label">SOCIAL CHANNELS · COMING LATER</span>
        </div>
        <div>
          <h3>Discover</h3>
          <Link href="/explore">Explore</Link><Link href="/movies">Movies</Link><Link href="/series">Series</Link><Link href="/originals">Originals & exclusives</Link><Link href="/premieres">Premieres & coming soon</Link>
        </div>
        <div>
          <h3>Flurzi Cinema</h3>
          <Link href="/about">About Flurzi Cinema</Link><Link href="/features">The experience</Link><Link href="/pricing">Membership</Link><Link href="/help">Help center</Link><Link href="/contact">Contact</Link>
        </div>
        <div>
          <h3>The details</h3>
          <Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/cookies">Cookies</Link><Link href="/legal/copyright">Copyright & content</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Flurzi Cinema.
        </span>
        <span>For the love of a good story.</span>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        flurzi<span>✳</span>
      </div>
    </footer>
  );
}
