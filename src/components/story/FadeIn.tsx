"use client";

import { useEffect, useRef } from "react";

import styles from "./FadeIn.module.css";

/**
 * Fades content in as it scrolls into view. Content is fully visible
 * without JavaScript and for anything already on screen at load; only
 * sections below the fold are armed to fade in.
 */
export function FadeIn({ children, className = "", as: Tag = "div", ...rest }: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already visible
    el.dataset.armed = "true";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.armed = "shown";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref as React.Ref<HTMLDivElement>} className={`${styles.fade} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
