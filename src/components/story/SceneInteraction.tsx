"use client";

import { useEffect, useRef, useState } from "react";

import { MagicBubble, ReefCleanup, SeaCreatures, TangledNet } from "@/components/aqua/AquaSceneInteractions";
import { CloudBridge, CloudSteps, WindChimes, WorriedCloud } from "@/components/cloud/CloudSceneInteractions";
import {
  ConnectDreams,
  LonelyStar,
  TelescopePeek,
  UnfinishedConstellation,
} from "@/components/star/StarSceneInteractions";
import styles from "./SceneInteraction.module.css";

/**
 * One gentle, optional interaction per story scene, keyed by the scene's
 * `interactionId`. Rendered inside the scene's image frame. Unknown ids
 * render nothing, so new stories can add scenes without breaking.
 */
export function SceneInteraction({ id }: { id?: string }) {
  switch (id) {
    case "wilted-flower":
      return <WiltedFlower />;
    case "water-seed":
      return <WaterSeed />;
    case "sunrise":
      return <Sunrise />;
    case "bloom-flowers":
      return <BloomFlowers />;
    case "blossom-reveal":
      return <RevealSparkles />;
    // Star Maria
    case "lonely-star":
      return <LonelyStar />;
    case "telescope-peek":
      return <TelescopePeek />;
    case "unfinished-constellation":
      return <UnfinishedConstellation />;
    case "connect-dreams":
      return <ConnectDreams />;
    case "star-reveal":
      return <RevealSparkles variant="stars" />;
    // Cloud Maria
    case "worried-cloud":
      return <WorriedCloud />;
    case "cloud-steps":
      return <CloudSteps />;
    case "wind-chimes":
      return <WindChimes />;
    case "cloud-bridge":
      return <CloudBridge />;
    case "cloud-reveal":
      return <RevealSparkles variant="clouds" />;
    // Aqua Maria
    case "magic-bubble":
      return <MagicBubble />;
    case "sea-creatures":
      return <SeaCreatures />;
    case "tangled-net":
      return <TangledNet />;
    case "reef-cleanup":
      return <ReefCleanup />;
    case "aqua-reveal":
      return <RevealSparkles variant="bubbles" />;
    default:
      return null;
  }
}

/** Scene 1: the flower trembles but does not bloom — the garden isn't healed yet. */
function WiltedFlower() {
  const [touches, setTouches] = useState(0);
  const messages = [
    "Tap the wilted flower Maria is touching.",
    "The flower trembles… it’s too tired to bloom.",
    "A single petal falls. It needs care, not just a touch.",
    "Maybe it needs something more… like a brand-new start.",
  ];
  return (
    <>
      <button
        type="button"
        className={styles.hotspot}
        style={{ left: "44%", top: "63%" }}
        onClick={() => setTouches((t) => Math.min(t + 1, messages.length - 1))}
        aria-label="Touch the wilted flower"
      >
        {/* Keyed so each tap replays the tremble without remounting the button. */}
        <span key={touches} className={styles.tremble} data-active={touches > 0} aria-hidden="true">
          <span className={styles.petal} />
        </span>
      </button>
      <p className={styles.caption} role="status">
        <span aria-hidden="true">🥀 </span>
        {messages[touches]}
      </p>
    </>
  );
}

/** Scene 2: a clearly marked watering control drips water onto the seed. */
function WaterSeed() {
  const [waterings, setWaterings] = useState(0);
  return (
    <>
      <div className={styles.drops} style={{ left: "55%", top: "56%" }} aria-hidden="true" key={waterings}>
        {waterings > 0 && [0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
      </div>
      <div className={styles.controlBar}>
        <button type="button" className={styles.control} onClick={() => setWaterings((w) => w + 1)}>
          <span aria-hidden="true">💧</span> Water the seed
        </button>
        <p className={styles.inlineCaption} role="status">
          {waterings === 0
            ? "Help Maria water her seed."
            : waterings < 3
              ? `The soil drinks it up. (${waterings} ${waterings === 1 ? "watering" : "waterings"})`
              : "The seed is cozy and well watered. Now… it needs time."}
        </p>
      </div>
    </>
  );
}

/**
 * Scene 3: night slowly turns to morning as the scene scrolls into view.
 * Driven by IntersectionObserver thresholds (no scroll listener).
 */
function Sunrise() {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el || typeof IntersectionObserver === "undefined") {
      setStage(3);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const r = entry.intersectionRatio;
        setStage((s) => Math.max(s, r > 0.85 ? 3 : r > 0.6 ? 2 : r > 0.3 ? 1 : 0));
      },
      { threshold: [0, 0.3, 0.6, 0.85, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const labels = ["Day 1 — nothing has grown.", "Day 2 — the soil looks the same.", "Day 3 — Maria keeps caring…", "One morning — a tiny sprout!"];
  return (
    <>
      <div ref={ref} className={styles.night} data-stage={stage} aria-hidden="true" />
      <p className={styles.caption} role="status">
        <span aria-hidden="true">{stage === 3 ? "🌱 " : "🌙 "}</span>
        {labels[stage]}
      </p>
    </>
  );
}

/** Scene 4: flowers pop open one after another across the garden. */
function BloomFlowers() {
  const [blooms, setBlooms] = useState(0);
  const spots = [
    { left: "8%", top: "78%", c: "#ff9fc3" },
    { left: "24%", top: "86%", c: "#ffd1e6" },
    { left: "40%", top: "80%", c: "#f78fb6" },
    { left: "58%", top: "88%", c: "#ffc6dc" },
    { left: "74%", top: "82%", c: "#e9a8ff" },
    { left: "90%", top: "86%", c: "#ffb3cf" },
  ];
  return (
    <>
      <div aria-hidden="true" key={blooms}>
        {blooms > 0 &&
          spots.map((s, i) => (
            <span
              key={i}
              className={styles.bloom}
              style={{ left: s.left, top: s.top, "--petal": s.c, animationDelay: `${i * 0.15}s` } as React.CSSProperties}
            />
          ))}
      </div>
      <div className={styles.controlBar}>
        <button type="button" className={styles.control} onClick={() => setBlooms((b) => b + 1)}>
          <span aria-hidden="true">🌸</span> {blooms === 0 ? "Help the garden bloom" : "Bloom again"}
        </button>
        <p className={styles.inlineCaption} role="status">
          {blooms === 0 ? "Tap to wake the flowers." : "The whole garden is waking up!"}
        </p>
      </div>
    </>
  );
}

/**
 * Scene 5: soft golden-and-pink petals (golden stars for Star, rising cloud
 * puffs and a brightening sky for Cloud, rising bubbles in turquoise and
 * golden light for Aqua) when the reveal appears.
 */
function RevealSparkles({ variant = "petals" }: { variant?: "petals" | "stars" | "clouds" | "bubbles" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setShown(true);
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={styles.sparkleLayer} data-shown={shown} data-variant={variant} aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          style={
            {
              left: `${6 + ((i * 37) % 88)}%`,
              animationDelay: `${(i % 7) * 0.35}s`,
              "--c": i % 2 ? "#ffd27a" : "#ffb3cf",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
