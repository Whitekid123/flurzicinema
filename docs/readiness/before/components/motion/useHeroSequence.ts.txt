"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";


/** One disposable timeline per image group; interruption never fights a master loop. */
export function useHeroSequence(root: RefObject<HTMLElement | null>, count: number) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const controller = useRef<{ choose: (index: number) => void } | null>(null);
  useEffect(() => {
    const host = root.current!;
    const media = matchMedia("(prefers-reduced-motion: no-preference)");
    let index = 0,
      held = false,
      hovered = false,
      focused = false,
      visible = true,
      timer = 0;
    let timeline: gsap.core.Timeline | undefined;
    const layers = Array.from(
      host.querySelectorAll<HTMLElement>(".hero-film-layer"),
    );
    const controls = host.querySelector(".hero-sequence-controls")!;
    const frame = host.querySelector(".hero-screen")!;
    const clearTimer = () => window.clearTimeout(timer);
    const settle = () => {
      timeline?.kill();
      gsap.set(
        layers.filter((el) => Number(el.dataset.film) === index),
        {
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          yPercent: 0,
          scale: 1,
          zIndex: 2,
        },
      );
      gsap.set(
        layers.filter((el) => Number(el.dataset.film) !== index),
        { opacity: 0, zIndex: 1 },
      );
    };
    const canPlay = () =>
      media.matches &&
      !held &&
      !hovered &&
      !focused &&
      visible &&
      !document.hidden &&
      (Number(host.style.getPropertyValue("--scene-progress")) || 0) < 0.12;
    const schedule = () => {
      clearTimer();
      host.dataset.sequence = canPlay() ? "playing" : "paused";
      if (canPlay())
        timer = window.setTimeout(() => {
          reveal((index + 1) % count);
          schedule();
        }, 5600);
    };
    const reveal = (next: number) => {
      timeline?.kill();
      const incoming = layers.filter((el) => Number(el.dataset.film) === next);
      const outgoing = layers.filter((el) => Number(el.dataset.film) !== next);
      index = next;
      setCurrent(next);
      if (!media.matches) {
        gsap.set(incoming, {
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          yPercent: 0,
          scale: 1,
        });
        gsap.set(outgoing, { opacity: 0 });
        return;
      }
      // Animate the image layers, never the scroll/pointer-controlled screen transforms.
      gsap.set(incoming, { zIndex: 2, opacity: 1 });
      gsap.set(outgoing, { zIndex: 1 });
      timeline = gsap.timeline({
        onComplete: () => {
          gsap.set(outgoing, { opacity: 0 });
        },
      });
      timeline.fromTo(
        incoming,
        { clipPath: "inset(100% 0% 0% 0%)", yPercent: 7, scale: 1.08 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          yPercent: 0,
          scale: 1,
          duration: 1.05,
          stagger: 0.13,
          ease: "power3.inOut",
        },
      );
    };
    const choose = (next: number) => {
      held = true;
      setPaused(true);
      reveal(next);
      schedule();
    };
    controller.current = { choose };
    const pause = () => {
      held = !held;
      if (held) settle();
      setPaused(held);
      schedule();
    };
    const pauseButton = host.querySelector(".hero-sequence-pause")!;
    const enter = () => {
      hovered = true;
      settle();
      schedule();
    };
    const leave = () => {
      hovered = false;
      schedule();
    };
    const focus = () => {
      focused = true;
      settle();
      schedule();
    };
    const blur = () => {
      focused = false;
      schedule();
    };
    const visibility = () => {
      if (!canPlay()) settle();
      schedule();
    };
    const preference = () => {
      reveal(index);
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visibility();
    });
    observer.observe(host);
    const scroll = () => {
      if (!canPlay()) settle();
      schedule();
    };
    for (const element of [frame, controls]) {
      element.addEventListener("pointerenter", enter);
      element.addEventListener("pointerleave", leave);
      element.addEventListener("focusin", focus);
      element.addEventListener("focusout", blur);
    }
    pauseButton.addEventListener("click", pause);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", preference);
    schedule();
    return () => {
      clearTimer();
      timeline?.kill();
      observer.disconnect();
      controller.current = null;
      for (const element of [frame, controls]) {
        element.removeEventListener("pointerenter", enter);
        element.removeEventListener("pointerleave", leave);
        element.removeEventListener("focusin", focus);
        element.removeEventListener("focusout", blur);
      }
      pauseButton.removeEventListener("click", pause);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", preference);
      gsap.set(layers, { clearProps: "all" });
    };
  }, [root, count]);
  return {
    current,
    paused,
    choose: (index: number) => controller.current?.choose(index),
  };
}
