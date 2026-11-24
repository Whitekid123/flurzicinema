import Image from "next/image";
import { movies } from "@/data/movies";
import type { Movie } from "@/types/cinema";

export function Manifesto({ onMovie }: { onMovie: (movie: Movie) => void }) {
  return (
    <section
      className="manifesto-section wrap"
      aria-labelledby="manifesto-title"
    >
      <p className="eyebrow">FOR THE LOVE OF THE STORY</p>
      <h2 id="manifesto-title">
        <span className="manifesto-line">You don’t just</span>
        <span className="manifesto-line">
          watch{" "}
          <button
            className="manifesto-cut"
            aria-label="Explore The Last Train North"
            onClick={() => onMovie(movies[1])}
          >
            <Image src={movies[1].backdrop} alt="" fill sizes="250px" />
          </button>{" "}
          a great film.
        </span>
        <span className="manifesto-line">
          You <i>feel</i> it<span className="amber">.</span>
        </span>
      </h2>
      <div className="manifesto-bottom">
        <span className="manifesto-note">
          BEAUTIFUL DISCOVERY.
          <br />
          SHARED EXPERIENCES.
          <br />
          STORIES THAT STAY.
        </span>
        <div>
          <p>
            A scene that stays with you. A world you want to know. A
            conversation that carries on after the credits.
          </p>
          <p>We’re imagining a home for all of it.</p>
          <a href="#features" className="text-link">
            Meet the Flurzi experience +
          </a>
        </div>
      </div>
    </section>
  );
}
