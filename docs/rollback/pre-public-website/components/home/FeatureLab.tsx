"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { movies } from "@/data/movies";
import type { Movie } from "@/types/cinema";
gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: "rooms",
    short: "Cinema Rooms",
    name: "The same story.\nEven miles apart.",
    description:
      "A shared screen, wherever life takes you. Explore the idea of a movie night that brings everyone into the room.",
  },
  {
    id: "match",
    short: "StoryMatch",
    name: "A little less searching.\nA lot more feeling.",
    description:
      "Start with your mood. Discover a story that meets you there, with a preview of preference-led discovery.",
  },
  {
    id: "lens",
    short: "StoryLens",
    name: "There’s more\nbetween the frames.",
    description:
      "Go a little deeper. Explore the places, themes and creative details behind a fictional film.",
  },
  {
    id: "data",
    short: "DataSense",
    name: "Your picture.\nYour perspective.",
    description:
      "Understand the balance between picture quality and data, before you press play.",
  },
];
export function FeatureLab({ onMovie }: { onMovie: (movie: Movie) => void }) {
  const root = useRef<HTMLElement>(null);
  const journey = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState("rooms");
  const [joined, setJoined] = useState(false);
  const [mood, setMood] = useState("Wonder");
  const [lens, setLens] = useState("The world");
  const [quality, setQuality] = useState("HD");
  const select = (id: string) => {
    setActive(id);
    const trigger = journey.current;
    if (trigger) {
      const index = features.findIndex((item) => item.id === id);
      // Use ScrollTrigger's setter so its scroll cache and the browser position
      // agree immediately, including when a native anchor was still moving.
      trigger.scroll(
        trigger.start +
          ((trigger.end - trigger.start) * index) / (features.length - 1),
      );
      trigger.update();
      trigger.getTween()?.progress(1);
    }
  };
  useEffect(() => {
    const mm = gsap.matchMedia();
    const context = gsap.context(() => {
      mm.add(
        "(min-width:1024px) and (prefers-reduced-motion:no-preference)",
        () => {
          const stage = root.current!.querySelector<HTMLElement>(
            ".feature-journey-stage",
          )!;
          const track = stage.querySelector(".feature-journey-track");
          const tween = gsap.to(track, {
            x: () => -stage.clientWidth * (features.length - 1),
            ease: "none",
            scrollTrigger: {
              id: "feature-journey",
              trigger: stage,
              start: "top 90px",
              end: () => `+=${stage.clientWidth * 2.4}`,
              pin: true,
              scrub: 0.65,
              invalidateOnRefresh: true,
              anticipatePin: 1,
              onUpdate: (self) =>
                setActive(
                  features[Math.round(self.progress * (features.length - 1))]
                    .id,
                ),
            },
          });
          journey.current = tween.scrollTrigger!;
          return () => {
            journey.current = null;
          };
        },
      );
    }, root);
    return () => {
      mm.revert();
      context.revert();
    };
  }, []);
  const matched =
    mood === "Escape" ? movies[1] : mood === "Intrigue" ? movies[2] : movies[0];
  return (
    <section
      ref={root}
      id="features"
      className="feature-section wrap section-space"
    >
      <div className="section-heading" data-reveal>
        <div>
          <p className="eyebrow">THE NEXT WAY TO WATCH</p>
          <h2 data-split-lines>
            More than a screen.
            <br />
            <span className="muted-serif">An experience.</span>
          </h2>
        </div>
        <p>
          Thoughtful ideas for the way you discover,
          <br className="desktop-break" /> connect, and get lost in a story.
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
                <span className="demo-tag">INTERACTIVE CONCEPT</span>
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
                  A local demonstration of a planned experience.
                </span>
              </div>
              <div className="feature-demo">
                {feature.id === "rooms" && (
                  <div className="room-demo">
                    <div className="demo-window-top">
                      <span>Friday, together.</span>
                      <span className="label">PRIVATE ROOM · DEMO</span>
                    </div>
                    <div className="room-screen">
                      <Image
                        src={movies[0].backdrop}
                        alt="The Quiet Beyond concept artwork"
                        fill
                        sizes="(max-width: 800px) 90vw, 45vw"
                      />
                      <div className="room-caption">
                        <span>THE QUIET BEYOND</span>
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
                          ? "You’re in the demo room"
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
                {feature.id === "match" && (
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
                        <small>A STORY FOR YOUR MOOD</small>
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
                {feature.id === "lens" && (
                  <div className="lens-demo">
                    <div className="lens-image">
                      <Image
                        src={movies[0].backdrop}
                        alt="Fictional landscape from The Quiet Beyond"
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
                {feature.id === "data" && (
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
          <span>Four ways to go beyond watching.</span>
          <span>SCROLL TO EXPLORE · OR CHOOSE ABOVE</span>
        </p>
      </div>
    </section>
  );
}
