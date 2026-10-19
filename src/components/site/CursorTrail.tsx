"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ambienceSlug } from "@/lib/ambience";
import { TRAILS, TRAIL_LIFETIME_MS, TRAIL_PARTICLE_LIMIT } from "@/lib/side-quests";
import styles from "./CursorTrail.module.css";

export function CursorTrail() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const slug = ambienceSlug(usePathname());
  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!surface || !context) return;
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let particles: { x: number; y: number; born: number; drift: number }[] = [];
    let frame = 0, last = -Infinity, width = 0, height = 0;
    const theme = TRAILS[slug];
    function resize() {
      width = innerWidth; height = innerHeight;
      const scale = Math.min(devicePixelRatio || 1, 2);
      surface!.width = width * scale; surface!.height = height * scale;
      context!.setTransform(scale, 0, 0, scale, 0, 0);
    }
    const clear = () => { cancelAnimationFrame(frame); frame = 0; particles = []; context.clearRect(0, 0, width, height); surface.dataset.particles = "0"; };
    function draw(now: number) {
      context!.clearRect(0, 0, width, height);
      particles = particles.filter(p => now - p.born < TRAIL_LIFETIME_MS);
      for (const p of particles) {
        const age = (now - p.born) / TRAIL_LIFETIME_MS;
        context!.globalAlpha = (1 - age) * .85;
        context!.font = `${19 - age * 6}px serif`;
        context!.fillStyle = theme.color;
        context!.fillText(theme.glyph, p.x + p.drift * age, p.y - age * 24);
      }
      context!.globalAlpha = 1;
      surface!.dataset.particles = String(particles.length);
      frame = particles.length ? requestAnimationFrame(draw) : 0;
    }
    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !pointer.matches || reduced.matches) return;
      const now = performance.now();
      if (now - last < 28) return;
      last = now;
      particles.push({ x: event.clientX + 7, y: event.clientY + 10, born: now, drift: Math.random() * 18 - 9 });
      if (particles.length > TRAIL_PARTICLE_LIMIT) particles.shift();
      if (!frame) frame = requestAnimationFrame(draw);
    }
    resize();
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", clear);
    window.addEventListener("resize", resize, { passive: true });
    pointer.addEventListener("change", clear); reduced.addEventListener("change", clear);
    return () => {
      clear(); document.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", clear);
      window.removeEventListener("resize", resize); pointer.removeEventListener("change", clear); reduced.removeEventListener("change", clear);
    };
  }, [slug]);
  return <canvas ref={canvas} className={styles.canvas} aria-hidden="true" data-cursor-trail={slug} data-trail-name={TRAILS[slug].name} />;
}
