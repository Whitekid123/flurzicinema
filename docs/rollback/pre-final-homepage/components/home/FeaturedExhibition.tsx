"use client";
import { useState, type CSSProperties } from "react";
import { useMovieCatalog } from "@/lib/CinemaCatalog";
import type { Movie } from "@/types/cinema";
import { Poster } from "@/components/ui/Poster";

export function FeaturedExhibition({
  onMovie,
}: {
  onMovie: (movie: Movie) => void;
}) {
  const movies = useMovieCatalog();
  const availableGenres=[...new Set(movies.flatMap(movie=>movie.genre.split(" / ")))];
  const spotlights=["All stories",...availableGenres.sort((a,b)=>{const order=["Adventure","Thriller"];return (order.includes(a)?order.indexOf(a):99)-(order.includes(b)?order.indexOf(b):99)}).slice(0,2)];
  const [spotlight, setSpotlight] = useState("All stories");
  return (
    <section
      id="explore"
      className="exhibition-section"
      aria-labelledby="exhibition-title"
    >
      <div className="exhibition-stage">
        <div className="exhibition-top">
          <span className="eyebrow">A COLLECTION OF POSSIBILITIES</span>
          <span className="label">FOLLOW YOUR CURIOSITY</span>
        </div>
        <h2 id="exhibition-title" className="choreo-heading">
          GET LOST<span className="amber">.</span>
        </h2>
        <p className="choreo-subtitle">Find your story.</p>
        <span className="choreo-tag choreo-tag-one">Leave the familiar.</span>
        <span className="choreo-tag choreo-tag-two">
          A different point of view.
        </span>
        <span className="choreo-tag choreo-tag-three">
          Something that stays.
        </span>
        <div className="choreo-layout">
          {movies.map((movie, index) => {
            const dim =
              spotlight !== "All stories" && !movie.genre.includes(spotlight);
            return (
              <article
                key={movie.id}
                className={`exhibition-card exhibit-card-${index} ${dim ? "is-dimmed" : ""}`}
                inert={dim}
                aria-hidden={dim || undefined}
                style={{ "--film-accent": movie.accentColor } as CSSProperties}
              >
                <div className="exhibit-art">
                  <Poster movie={movie} onSelect={() => onMovie(movie)} />
                </div>
                <div className="exhibit-caption">
                  <h3>{movie.title}</h3>
                  <span>
                    {movie.releaseYear} · {movie.genre.split(" / ")[0]}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
        <div className="choreo-end-copy">
          <p>
            Some stories don’t end at the credits.
            <br />
            Find the one that stays with you.
          </p>
          <a href="#vault" className="text-link">
            Step into the Cinema Vault +
          </a>
        </div>
        <div className="exhibition-bottom">
          <div className="filter-group" aria-label="Spotlight featured stories">
            {spotlights.map((item) => (
              <button
                key={item}
                onClick={() => setSpotlight(item)}
                aria-pressed={spotlight === item}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="label">
            {movies.every(movie=>movie.availability.startsWith("Fictional")) ? "ORIGINAL FICTIONAL CATALOG · SELECT A FILM TO EXPLORE" : "PUBLIC CATALOG PREVIEW · SELECT A FILM TO EXPLORE"}
          </span>
        </div>
      </div>
    </section>
  );
}
