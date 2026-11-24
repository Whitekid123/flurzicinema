import Image from "next/image";
import { movies } from "@/data/movies";
import type { Movie } from "@/types/cinema";
import { ProjectionAtmosphere } from "@/components/motion/ProjectionAtmosphere";

export function CinemaHero({ onMovie }: { onMovie: (movie: Movie) => void }) {
  return (
    <section id="home" className="cinema-hero" aria-labelledby="cinema-title">
      <div className="cinema-backdrop" aria-hidden="true">
        <Image src={movies[0].backdrop} alt="" fill unoptimized sizes="100vw" />
      </div>
      <div
        className="projector-light projector-light-warm"
        aria-hidden="true"
      />
      <div
        className="projector-light projector-light-cool"
        aria-hidden="true"
      />
      <ProjectionAtmosphere />
      <div className="hero-exhibit-top">
        <p className="eyebrow">ENTER THE FLURZI EXHIBITION</p>
        <span>
          FICTIONAL FILMS.
          <br />
          EXTRAORDINARY WORLDS.
        </span>
      </div>
      <div className="environment-perspective">
        <div className="environment-camera">
          <div className="hero-parallax">
            {[0, 1, 2, 3].map((index) => (
              <div
                className={`depth-frame depth-frame-${index}`}
                key={index}
                aria-hidden="true"
              />
            ))}
            <div className="side-screen side-screen-left" aria-hidden="true">
              <Image src={movies[1].poster} alt="" fill sizes="350px" />
              <span>A DIFFERENT DIRECTION</span>
            </div>
            <div className="side-screen side-screen-right" aria-hidden="true">
              <Image src={movies[2].poster} alt="" fill sizes="350px" />
              <span>ANOTHER WORLD AWAITS</span>
            </div>
            <button
              className="hero-screen"
              onClick={() => onMovie(movies[0])}
              aria-label="Explore The Quiet Beyond"
            >
              <Image
                src={movies[0].backdrop}
                alt="An amber eclipse above a volcanic coastline. Original fictional film artwork."
                fill
                unoptimized
                loading="eager"
                fetchPriority="high"
                sizes="100vw"
              />
              <span className="screen-edge screen-edge-top" />
              <span className="screen-edge screen-edge-bottom" />
              <span className="screen-caption">
                THE QUIET BEYOND <span>EXPLORE THE FILM +</span>
              </span>
            </button>
            <div className="screen-reflection" aria-hidden="true">
              <Image
                src={movies[0].backdrop}
                alt=""
                fill
                unoptimized
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      </div>
      <h1 id="cinema-title" className="hero-exhibit-title">
        <span className="hero-word-beyond">BEYOND</span>
        <span className="hero-word-watching">
          WATCHING<span className="amber">.</span>
        </span>
      </h1>
      <div className="cinema-hero-copy">
        <span className="label">THE SCREEN IS ONLY THE BEGINNING.</span>
        <p>
          Discover extraordinary stories.
          <br />
          Experience cinema beyond watching.
        </p>
      </div>
      <div className="hero-entry">
        <a href="#explore" className="button">
          Enter the collection
        </a>
        <a href="#features" className="hero-about-link">
          Inside Flurzi <span>+</span>
        </a>
      </div>
      <div className="hero-dock-slot" aria-hidden="true" />
      <div className="hero-dock-caption">
        <span>A FLURZI CINEMA EXHIBITION</span>
        <p>Every frame opens a world.</p>
        <a href="#explore" className="text-link">
          Keep exploring +
        </a>
      </div>
      <div className="hero-final-caption">
        <span className="label">IN THE FRAME</span>
        <strong>The Quiet Beyond</strong>
        <span>2026 · Mystery / Adventure · Demo</span>
      </div>
      <div className="hero-exhibit-bottom">
        <a href="#explore">SCROLL TO OPEN THE FRAME</a>
        <span>ORIGINAL ARTWORK · PUBLIC CONCEPT</span>
        <span className="hero-scroll-rail" aria-hidden="true">
          <span />
        </span>
      </div>
    </section>
  );
}
