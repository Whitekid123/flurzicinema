"use client";
import { useEffect, useRef } from "react";

/** A small depth-weighted dust field; never runs offscreen or under reduced motion. */
export function ProjectionAtmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas) return;
    const host = canvas.closest<HTMLElement>(".cinema-hero")!;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const constrained = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    const count =
      constrained.connection?.saveData || (constrained.deviceMemory || 8) < 4
        ? 20
        : 48;
    const particles = Array.from({ length: count }, (_, i) => ({
      x: ((i * 173 + 41) % 997) / 997,
      y: ((i * 107 + 83) % 991) / 991,
      depth: 0.2 + ((i * 37) % 100) / 125,
    }));
    let width = 0,
      height = 0,
      request = 0,
      previous = 0,
      visible = false;
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (time: number) => {
      if (!context) return;
      if (time - previous < 32) {
        request = requestAnimationFrame(draw);
        return;
      }
      const delta = Math.min((time - previous) / 1000 || 0, 0.05);
      previous = time;
      context.clearRect(0, 0, width, height);
      particles.forEach((particle, i) => {
        particle.x = (particle.x + delta * 0.014 * particle.depth) % 1;
        particle.y = (particle.y + delta * 0.003 * Math.sin(i)) % 1;
        context.globalAlpha = 0.12 + particle.depth * 0.32;
        context.fillStyle = i % 5 ? "#FFCA8B" : "#7FC9C2";
        context.beginPath();
        context.arc(
          particle.x * width,
          particle.y * height,
          particle.depth * 1.6,
          0,
          Math.PI * 2,
        );
        context.fill();
      });
      request = requestAnimationFrame(draw);
    };
    const update = () => {
      cancelAnimationFrame(request);
      const active = visible && !document.hidden && !preference.matches;
      host.dataset.ambient = active ? "active" : "still";
      canvas.dataset.motion = active ? (context ? "active" : "fallback") : "still";
      if (active && context) {
        previous = 0;
        request = requestAnimationFrame(draw);
      } else context?.clearRect(0, 0, width, height);
    };
    const resizeObserver = new ResizeObserver(resize);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    resizeObserver.observe(canvas);
    observer.observe(host);
    resize();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      cancelAnimationFrame(request);
      observer.disconnect();
      resizeObserver.disconnect();
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return <canvas ref={ref} className="projection-dust" aria-hidden="true" />;
}
