"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import type { Movie, MembershipPlan } from "@/types/cinema";
import { movies, faqs } from "@/data/movies";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { Modal } from "@/components/ui/Modal";

import { useCinemaMotion } from "@/components/motion/useExhibitionMotion";
import { FeatureLab } from "./FeatureLab";
import { Vault } from "./VaultExperience";
import { CinemaHero } from "./CinemaHero";
import { FeaturedExhibition } from "./FeaturedExhibition";
import { Manifesto } from "./Manifesto";
import { useSavedStories } from "@/lib/useSavedStories";

const membership: MembershipPlan = {
  id: "cinema",
  name: "Your seat is waiting.",
  description: "A considered membership for the way you love cinema.",
  priceLabel: "Plans & pricing to be announced",
  benefits: [
    "Thoughtful film discovery",
    "Shared viewing concepts",
    "Flexible viewing experiences",
  ],
};
const infoCopy: Record<string, string> = {
  "Sign in is coming later":
    "You’re exploring the public Flurzi Cinema concept. Accounts and authentication are part of a future phase. No credentials are collected here. For now, explore the films and try the local feature demonstrations.",
  "A new cinema experience":
    "This is a frontend preview of Flurzi Cinema. Membership prices, launch dates, supported devices and content availability are still to be confirmed. No account, payment or subscription is created here.",
  "About Flurzi":
    "Flurzi Cinema is a streaming platform concept shaped around beautiful discovery, shared experiences and the stories that stay with us. This is the first public homepage milestone. Every catalog title is fictional.",
  "Privacy preview":
    "This demo has no signup form, advertising trackers or analytics integration. Saved demo films are stored in this browser’s local storage only. Clear them from a film’s detail dialog or through your browser settings. A complete privacy policy must be provided before launch.",
  "Terms preview":
    "This website is an interactive product concept. Artwork and fictional titles demonstrate a possible experience. No streaming rights, release dates, subscription offers or commercial availability are implied. Official terms will be published before launch.",
  Support:
    "For this frontend preview, see the FAQ for details about the concept and planned capabilities. A support team and contact channels have not been established in this demo.",
};

export function CinemaHome() {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const { saved, toggleSaved, storageError } = useSavedStories();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useCinemaMotion(root);
  return (
    <div ref={root} className="cinema-home">
      <Header onSignIn={() => setInfo("Sign in is coming later")} />
      <main id="main">
        <CinemaHero onMovie={setSelected} />
        <FeaturedExhibition onMovie={setSelected} />
        <Manifesto onMovie={setSelected} />

        <Vault onMovie={setSelected} />
        <FeatureLab onMovie={setSelected} />

        <section
          id="series"
          className="premiere-section"
          aria-labelledby="premiere-title"
        >
          <div className="premiere-visual">
            <Image
              src="/images/velvet-hours.webp"
              alt="Rain and warm red light in a fictional city at night"
              fill
              sizes="100vw"
            />
            <div className="premiere-scrim" />
          </div>
          <div className="premiere-content wrap">
            <div className="premiere-top">
              <p className="eyebrow">ON THE HORIZON</p>
              <span className="demo-tag">FICTIONAL SERIES SPOTLIGHT</span>
            </div>
            <div className="premiere-main" data-reveal>
              <p className="label">SIX NIGHTS. ONE CITY. EVERY SECRET.</p>
              <h2 id="premiere-title">
                Velvet
                <br />
                <i>Hours.</i>
              </h2>
              <p>
                When the city falls asleep,
                <br />
                the real stories begin.
              </p>
              <button
                className="button button-outline"
                onClick={() => setSelected(movies[2])}
              >
                Discover the story +
              </button>
            </div>
            <div className="premiere-bottom">
              <span>A FLURZI CINEMA SERIES CONCEPT</span>
              <span>Release date & availability unannounced</span>
            </div>
          </div>
        </section>

        <section
          id="membership"
          className="membership-section wrap section-space"
        >
          <div className="membership-heading" data-reveal>
            <p className="eyebrow">MAKE ROOM FOR EXTRAORDINARY</p>
            <h2>
              Cinema, on
              <br />
              <span className="muted-serif">your terms.</span>
            </h2>
            <p>
              No noise. Just the stories you love,
              <br />
              and new ways to experience them.
            </p>
          </div>
          <div className="membership-card">
            <div className="membership-card-top">
              <span className="eyebrow">THE FLURZI MEMBERSHIP</span>
              <span aria-hidden="true" className="amber">
                ✳
              </span>
            </div>
            <h3>{membership.name}</h3>
            <p>{membership.description}</p>
            <ul>
              {membership.benefits.map((benefit) => (
                <li key={benefit}>
                  <span aria-hidden="true">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="membership-price">
              <span>{membership.priceLabel}</span>
              <p>Membership is in development. No payment required.</p>
            </div>
            <button
              className="button"
              onClick={() => setInfo("A new cinema experience")}
            >
              Explore the membership concept
            </button>
            <span className="membership-note">
              A preview of what’s to come. No subscriptions are sold here.
            </span>
          </div>
        </section>

        <section id="faq" className="faq-section wrap section-space">
          <div data-reveal>
            <p className="eyebrow">A FEW THINGS TO KNOW</p>
            <h2>
              Before the
              <br />
              <span className="muted-serif">opening scene.</span>
            </h2>
            <p>
              The concept, the plans,
              <br />
              and what comes next.
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

        <section className="final-cta">
          <div className="final-light" aria-hidden="true" />
          <p className="eyebrow">THE LIGHTS GO DOWN. A WORLD OPENS UP.</p>
          <h2>
            Your next great
            <br />
            <span className="muted-serif">story awaits.</span>
          </h2>
          <a className="button" href="#explore">
            Find your story
          </a>
          <p className="final-footnote">Flurzi Cinema · Beyond watching.</p>
        </section>
      </main>
      <Footer onInfo={setInfo} />
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
                ? "✓ Saved · Remove from my stories"
                : "+ Save to my stories"}
            </button>
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
