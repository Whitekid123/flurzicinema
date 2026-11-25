"use client";
import Link from 'next/link';
import {mockMode} from '@/lib/api/client';
import { useState, useRef, useCallback, useEffect } from "react";
import { Artwork as Image } from "@/components/ui/Artwork";
import { useMovieCatalog } from "@/lib/CinemaCatalog";
import type { Movie } from "@/types/cinema";


import { gsap } from "gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFeatureJourney } from "@/components/motion/useFeatureJourney";

const features = [
  {
    id: "rooms",
    short: "Cinema Rooms",
    name: "Movie night.\nTogether.",
    description:
      "A private place for your next shared movie night. Every viewer needs their own playback access.",
  },
  {
    id: "match",
    short: "StoryMatch",
    name: "Find movies that\nmatch your mood.",
    description:
      "Start with a feeling and explore stories that connect with your choices.",
  },
  {
    id: "lens",
    short: "StoryLens",
    name: "Get to know\nthe movie.",
    description:
      "Explore extra information about a movie, from its setting to its themes. Try a sample using a fictional film.",
  },
  {
    id: "data",
    short: "DataSense",
    name: "Streaming quality.\nData explained.",
    description:
      "Compare picture quality and estimated data use. Illustrative estimates do not change playback settings.",
  },
];
export function FeatureLab({ onMovie }: { onMovie: (movie: Movie) => void }) {
  const movies = useMovieCatalog();
  const [active, setActive] = useState("rooms");
  const [joined, setJoined] = useState(false);
  const [mood, setMood] = useState("Wonder");
  const [lens, setLens] = useState("The world");
  const [quality, setQuality] = useState("HD");
  const root = useRef<HTMLElement>(null);
  const journey = useRef<ScrollTrigger|null>(null);
  const onProgress = useCallback((index:number)=>setActive(features[index].id),[]);
  useFeatureJourney(root,journey,onProgress);
  const select = (id: string) => {
    setActive(id);
    const trigger=journey.current;
    if(trigger){
      trigger.scroll(trigger.start+(trigger.end-trigger.start)*features.findIndex(f=>f.id===id)/3);
      trigger.update();
    }
  };
  useEffect(()=>{
    if(matchMedia("(prefers-reduced-motion: reduce)").matches || journey.current)return;
    const ctx=gsap.context(()=>gsap.fromTo(".feature-panel.is-current",{opacity:0,x:28},{opacity:1,x:0,duration:.45,ease:"power3.out"}),root);
    return()=>ctx.revert();
  },[active]);
  const matched =
    mood === "Escape" ? (movies[1] || movies[0]) : mood === "Intrigue" ? (movies[2] || movies[0]) : movies[0];
  return (
    <section
      ref={root}
      id="features"
      className="feature-section wrap section-space editorial-features"
    >
      <div className="section-heading" data-reveal>
        <div>
          <p className="eyebrow">02 / PLANNED STREAMING FEATURES</p>
          <h2 data-editorial-lines>
            Choose how
            <br />
            <span className="muted-serif">you watch.</span>
          </h2>
        </div>
        <p>
          Thoughtful ways to discover movies,
          <br className="desktop-break" /> watching together and managing data.
        </p>
      </div>
      <div className="feature-journey-stage">
        <div
          className="feature-tabs"
          role="tablist"
          aria-label="Explore Flurzi features"
        >
          {features.map((item) => (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              role="tab"
              aria-selected={active === item.id}
              aria-controls={`feature-panel-${item.id}`}
              tabIndex={active === item.id ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(e) => {
                if (
                  e.key === "ArrowRight" ||
                  e.key === "ArrowLeft" ||
                  e.key === "Home" ||
                  e.key === "End"
                ) {
                  e.preventDefault();
                  const index = features.findIndex((f) => f.id === active);
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? features.length - 1
                        : (index +
                            (e.key === "ArrowRight"
                              ? 1
                              : features.length - 1)) %
                          features.length;
                  select(features[next].id);
                  document.getElementById(`tab-${features[next].id}`)?.focus();
                }
              }}
            >
              <span className="tab-symbol" aria-hidden="true">
                {item.id === "rooms"
                  ? "◉"
                  : item.id === "match"
                    ? "✳"
                    : item.id === "lens"
                      ? "⌘"
                      : "◈"}
              </span>
              {item.short}
            </button>
          ))}
        </div>
        <div className="feature-journey-track">
          {features.map((feature) => (
            <div
              key={feature.id}
              id={`feature-panel-${feature.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${feature.id}`}
              aria-hidden={active !== feature.id}
              inert={active !== feature.id}
              className={`feature-panel panel-${feature.id} ${active === feature.id ? "is-current" : ""}`}
            >
              <div className="feature-text">
                <span className="demo-tag">THE FLURZI EXPERIENCE</span>
                <h3>
                  {feature.name.split("\n").map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h3>
                <p>{feature.description}</p>
                <span className="feature-footnote">
                  Check availability in your account.
                </span>
              </div>
              <div className="feature-demo">
                {!mockMode&&<div className="room-demo"><div className="room-screen"><Image src={movies[0].backdrop} alt="Flurzi Cinema artwork" fill sizes="(max-width:800px) 90vw,45vw"/></div><div className="room-people"><Link className="button" href={feature.id==="rooms"?"/browse/rooms":feature.id==="match"?"/browse/storymatch":"/help"}>{feature.id==="rooms"?"Explore Cinema Rooms":feature.id==="match"?"Find your next story":"Learn more"}</Link></div></div>}{mockMode&&<p className="feature-footnote">Development preview · Illustrative interactions, not live services.</p>}{mockMode&&feature.id === "rooms" && (
                  <div className="room-demo">
                    <div className="demo-window-top">
                      <span>Friday, together.</span>
                      <span className="label">PRIVATE ROOM · DEMO</span>
                    </div>
                    <div className="room-screen">
                      <Image
                        src={movies[0].backdrop}
                        alt="Film artwork"
                        fill
                        sizes="(max-width: 800px) 90vw, 45vw"
                      />
                      <div className="room-caption">
                        <span>{movies[0].title}</span>
                        <span>Original concept still</span>
                      </div>
                    </div>
                    <div className="room-people">
                      <div className="avatars">
                        <span>J</span>
                        <span>M</span>
                        <span>A</span>
                        {joined && <span className="you-avatar">You</span>}
                      </div>
                      <span aria-live="polite">
                        {joined
                          ? "Your local seat is selected"
                          : "A seat saved for you"}
                      </span>
                      <button
                        className="button button-small"
                        onClick={() => setJoined(!joined)}
                      >
                        {joined ? "Leave room" : "Take a seat"}
                      </button>
                    </div>
                  </div>
                )}
                {mockMode&&feature.id === "match" && (
                  <div className="match-demo">
                    <p className="label">WHAT ARE YOU IN THE MOOD FOR?</p>
                    <div className="mood-options">
                      {["Wonder", "Escape", "Intrigue"].map((item) => (
                        <button
                          key={item}
                          aria-pressed={mood === item}
                          onClick={() => setMood(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <button
                      className="match-result"
                      onClick={() => onMovie(matched)}
                      aria-label={`Explore your match: ${matched.title}`}
                    >
                      <div className="match-image">
                        <Image src={matched.poster} fill alt="" sizes="150px" />
                      </div>
                      <span>
                        <small>A TITLE FOR YOUR MOOD</small>
                        <strong>{matched.title}</strong>
                        <span>{matched.genre}</span>
                        <span className="text-link">Explore your match +</span>
                      </span>
                    </button>
                    <p className="feature-footnote" aria-live="polite">
                      Sample match for “{mood}”. No personal data or AI service
                      used.
                    </p>
                  </div>
                )}
                {mockMode&&feature.id === "lens" && (
                  <div className="lens-demo">
                    <div className="lens-image">
                      <Image
                        src={movies[0].backdrop}
                        alt="Film landscape"
                        fill
                        sizes="500px"
                      />
                      <span className="lens-pin">A world beyond the map</span>
                    </div>
                    <div className="lens-options">
                      {["The world", "The theme", "The craft"].map((item) => (
                        <button
                          key={item}
                          aria-pressed={lens === item}
                          onClick={() => setLens(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <p aria-live="polite">
                      {lens === "The world"
                        ? "An imagined volcanic coastline, where a familiar landscape becomes something entirely unknown."
                        : lens === "The theme"
                          ? "The story explores the courage it takes to step beyond certainty, and the quiet things that guide us."
                          : "Warm amber against blue-black shadows creates a visual tension between invitation and uncertainty."}
                    </p>
                  </div>
                )}
                {mockMode&&feature.id === "data" && (
                  <div className="data-demo">
                    <span className="quality-display">
                      {quality}
                      <span>YOUR VIEWING PREFERENCE</span>
                    </span>
                    <fieldset>
                      <legend>Choose a picture quality</legend>
                      <div className="quality-options">
                        {["SD", "HD", "4K"].map((item) => (
                          <label key={item}>
                            <input
                              type="radio"
                              name="quality"
                              value={item}
                              checked={quality === item}
                              onChange={() => setQuality(item)}
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="data-estimate" aria-live="polite">
                      <strong>
                        {quality === "SD"
                          ? "0.7"
                          : quality === "HD"
                            ? "3"
                            : "7"}{" "}
                        GB
                      </strong>
                      <span>Illustrative data per hour</span>
                    </div>
                    <p className="feature-footnote">
                      Estimates only. Actual usage depends on codec, bitrate and
                      device; these are not available streaming tiers.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="feature-journey-progress" aria-hidden="true">
          <span
            style={{
              transform: `translateX(${features.findIndex((item) => item.id === active) * 100}%)`,
            }}
          />
        </div>
        <p className="feature-journey-note">
          <span>Four planned tools for movie and TV streaming.</span>
          <span>SCROLL THROUGH THE EXPERIENCES · OR CHOOSE ABOVE</span>
        </p>
      </div>
    </section>
  );
}
