"use client";
import { useRef, useState } from "react";
import { Artwork as Image } from "@/components/ui/Artwork";
import Link from "next/link";
import { CinemaCatalogProvider, useMovieCatalog } from "@/lib/CinemaCatalog";
import type { PublicTitle } from "@/types/public";
import { titleHref } from "@/data/catalog";
import type { Movie } from "@/types/cinema";
import { faqs } from "@/data/movies";
import {DevelopmentNotice} from "@/components/ui/DevelopmentNotice";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { Modal } from "@/components/ui/Modal";

import { useEditorialMotion } from "@/components/motion/useEditorialMotion";
import { FeatureLab } from "./FeatureLab";
import { Vault } from "./VaultExperience";
import { FallingFilms } from "./FallingFilms";
import { CinemaHero } from "./CinemaHero";
import { FeaturedExhibition } from "./FeaturedExhibition";

import { useSavedStories } from "@/lib/useSavedStories";
import { EditorialSpotlight, EditorialFinale } from "./EditorialScenes";
import { PublicShell } from "@/components/public/PublicShell";

const infoCopy: Record<string,string> = {Support:"Visit the help center for account and viewing guidance."};

export function CinemaHome({ titles }: { titles: PublicTitle[] }) {
  if (!titles.length) return <PublicShell><div className="wrap section-space"><h1>The collection is currently unavailable.</h1><Link className="button" href="/help">Visit Help</Link></div></PublicShell>;
  return <CinemaCatalogProvider titles={titles.slice(0, 5)}><CinemaHomeContent /></CinemaCatalogProvider>;
}
function CinemaHomeContent() {
  const movies = useMovieCatalog();
  const series = movies.find(movie => movie.format === "Series") || movies[0];
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const { saved, toggleSaved, storageError } = useSavedStories();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useEditorialMotion(root);
  return (
    <div ref={root} className="cinema-home editorial-home">
      <Header />
      <main id="main">
        <CinemaHero onMovie={setSelected} /><DevelopmentNotice/>
        <FallingFilms onMovie={setSelected} />
        <FeaturedExhibition onMovie={setSelected} />
        <Vault onMovie={setSelected} />
        <FeatureLab onMovie={setSelected} />

        <EditorialSpotlight movie={series} onMovie={setSelected} />

        <section id="faq" className="faq-section wrap section-space">
          <div data-reveal>
            <p className="eyebrow">FLURZI CINEMA · FAQ</p>
            <h2>
              Your questions.
              <br />
              <span className="muted-serif">Answered.</span>
            </h2>
            <p>
              Memberships, viewing features,
              <br />
              and what is available in this preview.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div
                className={`faq-item ${openFaq === i ? "is-open" : ""}`}
                key={faq.question}
              >
                <h3>
                  <button
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.question}
                    <span aria-hidden="true">{openFaq === i ? "−" : "+"}</span>
                  </button>
                </h3>
                <div
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  id={`faq-panel-${i}`}
                  hidden={openFaq !== i}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <EditorialFinale movie={movies[0]} />
      </main>
      <Footer />
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)} wide>
          <div className="movie-modal-art">
            <Image
              src={selected.backdrop}
              alt={`Original concept artwork for ${selected.title}`}
              fill
              sizes="(max-width: 700px) 100vw, 800px"
            />
            <span className="modal-art-shade" />
          </div>
          <div className="movie-modal-copy">
            <span className="demo-tag">{selected.availability}</span>
            <h2>{selected.title}</h2>
            <p className="movie-meta">
              {selected.releaseYear} <span>·</span> {selected.genre}{" "}
              <span>·</span> {selected.runtime} <span>·</span> {selected.format}
            </p>
            <p>{selected.synopsis}</p>
            <button
              className={`button ${saved.includes(selected.id) ? "button-outline" : ""}`}
              onClick={() => toggleSaved(selected.id)}
            >
              {saved.includes(selected.id)
                ? "✓ Saved · Remove from watchlist"
                : "+ Add to watchlist"}
            </button>
            <Link className="text-link" href={titleHref({ slug: selected.slug || selected.id, format: selected.format })}>View full title details</Link>
            <p className="feature-footnote" aria-live="polite">
              {saved.includes(selected.id)
                ? storageError
                  ? "Saved for this visit. Browser storage is unavailable."
                  : "Saved in this browser. No account needed."
                : "Explore the concept. Streaming and trailers are not available."}
            </p>
          </div>
        </Modal>
      )}
      {info && (
        <Modal title={info} onClose={() => setInfo(null)}>
          <span className="eyebrow">FLURZI CINEMA · PUBLIC PREVIEW</span>
          <h2>{info}</h2>
          <p>{infoCopy[info]}</p>
          <button className="button" onClick={() => setInfo(null)}>
            Keep exploring
          </button>
        </Modal>
      )}
    </div>
  );
}
