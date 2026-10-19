"use client";

import { useEffect, useRef } from "react";

/** Scoped, frame-throttled progress for an element entering the reading viewport. */
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    const update = () => {
      frame = 0;
      const progress = motion.matches ? 1 : Math.min(1, Math.max(0, (innerHeight * .9 - element.getBoundingClientRect().top) / (innerHeight * .65)));
      element.style.setProperty("--route-reveal", String(progress));
      element.dataset.scrollProgress = progress.toFixed(3);
    };
    const schedule = () => { if (visible && !frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); }, { rootMargin: "100px" });
    observer.observe(element);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    motion.addEventListener("change", update);
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", update);
    };
  }, []);
  return ref;
}
