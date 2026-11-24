"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMovieCatalog } from "@/lib/CinemaCatalog";
import type { Movie } from "@/types/cinema";
import { Poster } from "@/components/ui/Poster";
import { Reel } from "@/components/ui/Icon";

gsap.registerPlugin(Flip, ScrollTrigger);
export function Vault({ onMovie }: { onMovie: (movie: Movie) => void }) {
  const movies = useMovieCatalog();
  const [view, setView] = useState<"timeline" | "grid">("timeline");
  const [filter, setFilter] = useState("All stories");
  const [selectedId, setSelectedId] = useState(movies[Math.min(2, movies.length - 1)].id);
  const [spread, setSpread] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    const section = root.current?.closest<HTMLElement>(".vault-rescue");
    const observer = new IntersectionObserver(([entry]) => {
      if (section) section.dataset.inView = String(entry.isIntersecting);
    });
    if (section) observer.observe(section);
    return () => {
      observer.disconnect();
      animation.current?.kill();
    };
  }, []);
  const displayed = movies.filter(
    (movie) => filter === "All stories" || movie.format === filter,
  );
  const selected =
    displayed.find((movie) => movie.id === selectedId) || displayed[0];
  const selectedIndex = displayed.indexOf(selected);
  const years = [...new Set(displayed.map((movie) => movie.releaseYear))];
  function animateUpdate(update: () => void) {
    animation.current?.progress(1).kill();
    const cards = root.current?.querySelectorAll(".vault-item");
    const state = cards ? Flip.getState(cards) : null;
    flushSync(update);
    const track = root.current;
    // Flip temporarily takes cards out of flow. Preserve the final track height
    // so subsequent pinned scenes cannot slide over the collection mid-transition.
    if (track)
      track.style.minHeight = `${track.getBoundingClientRect().height}px`;
    const complete = () => {
      if (track) track.style.minHeight = "";
      ScrollTrigger.refresh();
    };
    if (state && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animation.current = Flip.from(state, {
        duration: 0.9,
        ease: "power3.inOut",
        stagger: 0.045,
        absolute: true,
        scale: true,
        onComplete: complete,
      });
      ScrollTrigger.refresh();
    } else complete();
  }
  function select(movie: Movie) {
    if (movie.id !== selectedId) animateUpdate(() => setSelectedId(movie.id));
  }
  function changeFilter(next: string) {
    if (next === filter) return;
    animateUpdate(() => {
      setFilter(next);
      const candidates = movies.filter(
        (movie) => next === "All stories" || movie.format === next,
      );
      if (!candidates.some((movie) => movie.id === selectedId))
        if (candidates.length) setSelectedId(candidates[0].id);
    });
  }
  return (
    <section
      id="vault"
      className={`vault-section vault-rescue section-space view-${view}`}
      style={{ "--active-accent": selected.accentColor } as CSSProperties}
    >
      <div className="wrap">
        <div className="vault-masthead">
          <div>
            <p className="eyebrow">COLLECT MOMENTS. FOLLOW STORIES.</p>
            <h2>
              The Cinema
              <br />
              <span>
                VAULT<span className="amber">.</span>
              </span>
            </h2>
          </div>
          <div className="vault-intro">
            <p>
              Every era. Every feeling.
              <br />
              Pick a sleeve. Open a world.
            </p>
            <span className="label">{movies.every(movie=>movie.availability.startsWith("Fictional")) ? "A FICTIONAL FILM COLLECTION" : "THE PUBLIC FILM COLLECTION"}</span>
          </div>
        </div>
        <div className="vault-toolbar">
          <div className="filter-group" aria-label="Filter the demo catalog">
            {["All stories", ...[...new Set(movies.map(movie => movie.format))]].map((item) => (
              <button
                key={item}
                aria-pressed={filter === item}
                onClick={() => changeFilter(item)}
              >
                {item === "Film" ? "Movies" : item}
              </button>
            ))}
          </div>
          <div className="view-switch" aria-label="Vault layout">
            {(["timeline", "grid"] as const).map((mode) => (
              <button
                key={mode}
                aria-pressed={view === mode}
                onClick={() => {
                  if (view !== mode) animateUpdate(() => setView(mode));
                }}
              >
                <span aria-hidden="true">
                  {mode === "timeline" ? "◷" : "⊞"}
                </span>
                {mode === "timeline" ? "Timeline" : "Grid"}
              </button>
            ))}
          </div>
        </div>
        <div className="vault-layout">
          <div
            ref={root}
            className={`vault-track ${view === "grid" ? "vault-grid" : "vault-timeline"} ${spread ? "fan-spread" : "fan-gathered"}`}
            aria-label={`${view} movie collection`}
            onKeyDown={(event) => {
              if (
                (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
                (event.target as HTMLElement).closest(".poster")
              ) {
                event.preventDefault();
                const next = Math.max(
                  0,
                  Math.min(
                    displayed.length - 1,
                    selectedIndex + (event.key === "ArrowRight" ? 1 : -1),
                  ),
                );
                select(displayed[next]);
                root.current
                  ?.querySelectorAll<HTMLButtonElement>(".poster")
                  [next]?.focus({ preventScroll: true });
              }
            }}
          >
            <div className="vault-record" aria-hidden="true">
              <div className="record-rotor">
                <Reel />
                <div className="record-grooves" />
              </div>
              <span className="record-hub">
                FLURZI
                <br />
                CINEMA
              </span>
            </div>
            {displayed.map((movie, index) => {
              const offset = index - selectedIndex;
              return (
                <article
                  key={movie.id}
                  className={`vault-item ${movie.id === selected.id ? "is-selected" : ""}`}
                  data-year={movie.releaseYear}
                  style={
                    {
                      "--fan-x": `${offset * (spread ? 31 : 18)}%`,
                      "--fan-y": `${Math.abs(offset) * (spread ? 23 : 14) - (offset === 0 ? 24 : 0)}px`,
                      "--fan-angle": `${offset * (spread ? 10 : 5)}deg`,
                      "--fan-scale": offset === 0 ? 1.06 : 0.88,
                      zIndex: offset === 0 ? 40 : 20 - Math.abs(offset),
                    } as CSSProperties
                  }
                >
                  <div className="vault-art">
                    <Poster
                      movie={movie}
                      onSelect={() => select(movie)}
                      actionLabel={`Select ${movie.title}`}
                      selected={movie.id === selected.id}
                    />
                  </div>
                  <div className="vault-caption">
                    <h3>{movie.title}</h3>
                    <span>
                      {movie.releaseYear} · {movie.format}
                    </span>
                  </div>
                </article>
              );
            })}
            {view === "timeline" && (
              <button
                className="fan-control"
                aria-expanded={spread}
                onClick={() => animateUpdate(() => setSpread(!spread))}
              >
                {spread ? "Gather collection" : "Spread collection"}
                <span aria-hidden="true">{spread ? "−" : "+"}</span>
              </button>
            )}
          </div>
          <div className="vault-selection" key={selected.id}>
            <div className="selection-year" aria-hidden="true">
              {selected.releaseYear}
            </div>
            <span className="eyebrow">ON YOUR REEL</span>
            <div className="selection-copy" aria-live="polite">
              <h3>{selected.title}</h3>
              <p className="selection-meta">
                {selected.releaseYear} · {selected.genre} · {selected.runtime}
              </p>
              <p>{selected.synopsis}</p>
            </div>
            <button
              className="button button-outline"
              onClick={() => onMovie(selected)}
            >
              Explore {selected.format === "Series" ? "the series" : "the film"}{" "}
              +
            </button>
            <span className="selection-disclaimer">
              Catalog preview · Availability to be confirmed.
            </span>
          </div>
        </div>
        <div className="vault-chronology">
          <span className="label">FOLLOW THE YEARS</span>
          <div className="year-markers" aria-label="Browse films by year">
            {years.map((year) => (
              <button
                key={year}
                aria-pressed={selected.releaseYear === year}
                onClick={() =>
                  select(displayed.find((movie) => movie.releaseYear === year)!)
                }
              >
                {year}
              </button>
            ))}
          </div>
          <div className="vault-paging">
            <button
              aria-label="Previous film"
              disabled={selectedIndex === 0}
              onClick={() => select(displayed[selectedIndex - 1])}
            >
              ‹
            </button>
            <button
              aria-label="Next film"
              disabled={selectedIndex === displayed.length - 1}
              onClick={() => select(displayed[selectedIndex + 1])}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
