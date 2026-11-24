import { Brand } from "./Header";

export function Footer({ onInfo }: { onInfo: (topic: string) => void }) {
  return (
    <footer className="footer wrap">
      <div className="footer-top">
        <a href="#home" aria-label="Flurzi Cinema home">
          <Brand />
        </a>
        <p>For the love of the story.</p>
        <a className="text-link" href="#home">
          Back to the beginning
        </a>
      </div>
      <div className="footer-columns">
        <div className="footer-description">
          <p>
            A new perspective on cinema.
            <br />A public frontend concept, made for what comes next.
          </p>
          <span className="label">SOCIAL CHANNELS · COMING LATER</span>
        </div>
        <div>
          <h3>Discover</h3>
          <a href="#explore">Featured stories</a>
          <a href="#vault">The Cinema Vault</a>
          <a href="#features">The experience</a>
        </div>
        <div>
          <h3>Flurzi Cinema</h3>
          <button onClick={() => onInfo("About Flurzi")}>
            About the concept
          </button>
          <a href="#membership">Membership</a>
          <a href="#faq">Help & FAQ</a>
        </div>
        <div>
          <h3>The details</h3>
          <button onClick={() => onInfo("Privacy preview")}>
            Privacy preview
          </button>
          <button onClick={() => onInfo("Terms preview")}>Terms preview</button>
          <button onClick={() => onInfo("Support")}>Support</button>
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
