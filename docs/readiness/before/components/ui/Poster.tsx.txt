import { Artwork as Image } from "./Artwork";
import type { CSSProperties } from "react";
import type { Movie } from "@/types/cinema";

export function Poster({
  movie,
  onSelect,
  priority = false,
  actionLabel,
  selected,
}: {
  movie: Movie;
  onSelect: () => void;
  priority?: boolean;
  actionLabel?: string;
  selected?: boolean;
}) {
  return (
    <button
      className={`poster poster-${movie.id}`}
      onClick={onSelect}
      aria-label={actionLabel || `Explore ${movie.title}`}
      aria-pressed={selected}
      style={{ "--poster-accent": movie.accentColor } as CSSProperties}
    >
      <Image
        src={movie.poster}
        alt=""
        fill
        sizes={
          movie.id === "quiet-beyond"
            ? "(max-width: 600px) 800px, 900px"
            : "(max-width: 600px) 80vw, (max-width: 1000px) 40vw, 35vw"
        }
        priority={priority}
      />
      <span className="poster-shade" />
      <span className="poster-top">A FLURZI CINEMA CONCEPT</span>
      <span className="poster-title">{movie.title}</span>
      <span className="poster-bottom">
        {movie.genre.split(" / ")[0]}{" "}
        <span>{actionLabel ? "SELECT +" : "EXPLORE +"}</span>
      </span>
    </button>
  );
}
