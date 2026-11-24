import { Artwork as Image } from "@/components/ui/Artwork";
import { useRef } from "react";
import { useMovieCatalog } from "@/lib/CinemaCatalog";
import type { Movie } from "@/types/cinema";
import { ImmersiveCinemaBackground } from "@/components/motion/ImmersiveCinemaBackground";
import { useHeroSequence } from "@/components/motion/useHeroSequence";

export function CinemaHero({ onMovie }: { onMovie: (movie: Movie) => void }) {
  const movies = useMovieCatalog();
  const root = useRef<HTMLElement>(null);
  const { current, paused, choose } = useHeroSequence(root, movies.length);
  const film = movies[current];
  return (
    <section
      ref={root}
      id="home"
      className="cinema-hero"
      aria-labelledby="cinema-title"
    >
      <div className="cinema-backdrop" aria-hidden="true">
        <Image src={film.backdrop} alt="" fill unoptimized sizes="100vw" />
      </div>
      <div
        className="projector-light projector-light-warm"
        aria-hidden="true"
      />
      <div
        className="projector-light projector-light-cool"
        aria-hidden="true"
      />
      <ImmersiveCinemaBackground />
      <div className="hero-exhibit-top">
        <p className="eyebrow">ENTER THE FLURZI EXHIBITION</p>
        <span>
          {film.availability.startsWith("Fictional") ? "FICTIONAL FILMS." : "CATALOG PREVIEW."}
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
              {movies.map((movie, i) => (
                <div className="hero-film-layer" data-film={i} key={movie.id}>
                  <Image
                    src={movies[(i + 1) % movies.length].poster}
                    alt=""
                    fill
                    sizes="350px"
                  />
                </div>
              ))}
              <span>A DIFFERENT DIRECTION</span>
            </div>
            <div className="side-screen side-screen-right" aria-hidden="true">
              {movies.map((movie, i) => (
                <div className="hero-film-layer" data-film={i} key={movie.id}>
                  <Image
                    src={movies[(i + 2) % movies.length].poster}
                    alt=""
                    fill
                    sizes="350px"
                  />
                </div>
              ))}
              <span>ANOTHER WORLD AWAITS</span>
            </div>
            <button
              className="hero-screen"
              onClick={() => onMovie(film)}
              aria-label={`Explore ${film.title}`}
            >
              {movies.map((movie, i) => (
                <div className="hero-film-layer" data-film={i} key={movie.id}>
                  <Image
                    src={movie.backdrop}
                    alt={`Original fictional film artwork for ${movie.title}`}
                    fill
                    unoptimized
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    sizes="100vw"
                  />
                </div>
              ))}
              <span className="screen-edge screen-edge-top" />
              <span className="screen-edge screen-edge-bottom" />
              <span className="screen-caption">
                {film.title.toUpperCase()}{" "}
                <span>EXPLORE THE {film.format.toUpperCase()} +</span>
              </span>
            </button>
            <div className="screen-reflection" aria-hidden="true">
              <Image
                src={film.backdrop}
                alt=""
                fill
                unoptimized
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="hero-sequence-controls"
        aria-label="Choose a film in the opening sequence"
      >
        <div className="hero-sequence-films">
          {movies.map((movie, i) => (
            <button
              key={movie.id}
              aria-label={`Show ${movie.title}`}
              aria-pressed={current === i}
              onClick={() => choose(i)}
            >
              <span className="sequence-film-mark" aria-hidden="true" />
              <span className="sequence-film-name">{movie.title}</span>
            </button>
          ))}
        </div>
        <button
          className="hero-sequence-pause"
          aria-pressed={paused}
          aria-label={paused ? "Play film sequence" : "Pause film sequence"}
        >
          {paused ? "PLAY" : "PAUSE"}
        </button>
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
          <span data-split-hover>Enter the collection</span>
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
        <strong>{film.title}</strong>
        <span>
          {film.releaseYear} · {film.genre} · Demo
        </span>
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
