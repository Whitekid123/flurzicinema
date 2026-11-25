"use client";
import { useRef, useState } from "react";
import { Artwork as Image } from "@/components/ui/Artwork";
import Link from "next/link";
import { CinemaCatalogProvider, useMovieCatalog } from "@/lib/CinemaCatalog";
import type { PublicTitle } from "@/types/public";
import { titleHref } from "@/data/catalog";
import type { Movie } from "@/types/cinema";
import { faqs } from "@/data/movies";
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

const infoCopy: Record<string, string> = {
  "Sign in is coming later":
    "You’re exploring the public Flurzi Cinema concept. Accounts and authentication are part of a future phase. No credentials are collected here. For now, explore the films and try the local feature demonstrations.",
  "A new cinema experience":
    "This is a frontend preview of Flurzi Cinema. Membership prices, launch dates, supported devices and content availability are still to be confirmed. No account, payment or subscription is created here.",
  "About Flurzi":
    "Flurzi Cinema is a movie and television streaming platform in development. Explore the catalog and planned viewing features in this public preview. The default catalog is fictional; streaming is not available.",
  "Privacy preview":
    "This demo has no signup form, advertising trackers or analytics integration. Saved demo films are stored in this browser’s local storage only. Clear them from a film’s detail dialog or through your browser settings. A complete privacy policy must be provided before launch.",
  "Terms preview":
    "This website is an interactive product concept. Artwork and fictional titles demonstrate a possible experience. No streaming rights, release dates, subscription offers or commercial availability are implied. Official terms will be published before launch.",
  Support:
    "For this frontend preview, see the FAQ for details about the concept and planned capabilities. A support team and contact channels have not been established in this demo.",
};

export function CinemaHome({ titles }: { titles: PublicTitle[] }) {
  if (!titles.length) return <PublicShell><div className="wrap section-space"><h1>The collection is taking shape.</h1><Link className="button" href="/help">Visit Help</Link></div></PublicShell>;
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
      <Header onSignIn={() => setInfo("Sign in is coming later")} />
      <main id="main">
        <CinemaHero onMovie={setSelected} />
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
