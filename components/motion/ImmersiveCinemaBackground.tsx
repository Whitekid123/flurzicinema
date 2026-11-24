"use client";
import { useEffect, useRef } from "react";
import type { createCinemaScene } from "@/lib/cinemaScene";

export function ImmersiveCinemaBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current!;
    const section = host.closest<HTMLElement>(".cinema-hero")!;
    const media = matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );
    const device = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const pointer = { x: 0, y: 0 };
    let scene: ReturnType<typeof createCinemaScene> | undefined;
    let canvas: HTMLCanvasElement | undefined;
    let stopped = false,
      visible = true,
      request = 0,
      previous = 0,
      elapsed = 0,
      generation = 0,
      samples = 0,
      slow = 0;
    const draw = (time: number) => {
      if (!scene) return;
      const delta = time - previous;
      if (delta >= 32) {
        if (previous && delta > 65) slow++;
        previous = time;
        elapsed += Math.min(delta || 32, 80) / 1000;
        const progress =
          Number(section.style.getPropertyValue("--scene-progress")) || 0;
        scene.render(elapsed, progress, pointer);
        if (++samples === 90 && slow > 35) {
          scene.downgrade();
          host.dataset.quality = "light";
        }
      }
      request = requestAnimationFrame(draw);
    };
    const update = () => {
      cancelAnimationFrame(request);
      previous = 0;
      const active = visible && !document.hidden && media.matches && !!scene;
      host.dataset.motion =
        media.matches && scene ? (active ? "active" : "paused") : "still";
      section.dataset.ambient = active ? "active" : "still";
      if (active) request = requestAnimationFrame(draw);
    };
    const release = () => {
      cancelAnimationFrame(request);
      canvas?.removeEventListener("webglcontextlost", lost);
      scene?.dispose();
      scene = undefined;
      canvas?.remove();
      canvas = undefined;
    };
    const lost = (event: Event) => {
      event.preventDefault();
      release();
      host.dataset.renderer = "fallback";
      update();
    };
    const setup = async () => {
      const current = ++generation;
      release();
      host.dataset.renderer = "fallback";
      update();
      if (
        !media.matches ||
        device.connection?.saveData ||
        (device.deviceMemory || 8) < 4
      )
        return;
      const { createCinemaScene } = await import("@/lib/cinemaScene");
      if (stopped || current !== generation) return;
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      const context = canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
      if (!context) {
        canvas = undefined;
        return;
      }
      host.append(canvas);
      try {
        scene = createCinemaScene(canvas, context);
        canvas.addEventListener("webglcontextlost", lost);
        host.dataset.renderer = "webgl";
        scene.render(0, 0, pointer);
        update();
      } catch {
        release();
        host.dataset.renderer = "fallback";
        update();
      }
    };
    const resize = new ResizeObserver(() => scene?.resize());
    resize.observe(host);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(section);
    const move = (event: PointerEvent) => {
      const box = section.getBoundingClientRect();
      pointer.x = (event.clientX - box.left) / box.width - 0.5;
      pointer.y = 0.5 - (event.clientY - box.top) / box.height;
    };
    const leave = () => {
      pointer.x = pointer.y = 0;
    };
    const preference = () => {
      void setup();
    };
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", update);
    media.addEventListener("change", preference);
    void setup();
    return () => {
      stopped = true;
      generation++;
      release();
      resize.disconnect();
      observer.disconnect();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", update);
      media.removeEventListener("change", preference);
    };
  }, []);
  return (
    <div
      ref={ref}
      className="immersive-cinema"
      aria-hidden="true"
      data-renderer="fallback"
      data-motion="still"
    >
      <svg
        className="projection-chamber-fallback"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="chamber-edge">
            <stop stopColor="#7FC9C2" />
            <stop offset="1" stopColor="#F1AE64" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x={25 + i * 73}
            y={110 + i * 51}
            width={1390 - i * 146}
            height={830 - i * 102}
            fill="none"
            stroke="url(#chamber-edge)"
            strokeWidth={i ? 1 : 2}
            opacity={0.22 - i * 0.025}
          />
        ))}
        <path
          d="M0 1000 610 490M1440 1000 830 490M240 1000 660 490M1200 1000 780 490"
          stroke="url(#chamber-edge)"
          opacity=".16"
        />
      </svg>
      <div className="chamber-vignette" />
    </div>
  );
}
