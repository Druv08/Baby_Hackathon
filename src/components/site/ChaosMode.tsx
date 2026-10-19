"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { ambienceSlug } from "@/lib/ambience";
import { chaosPreference } from "@/lib/site-preferences";
import { TRAILS } from "@/lib/side-quests";
import "./ChaosMode.css";

export function ChaosMode() {
  const enabled = useSyncExternalStore(chaosPreference.subscribe, chaosPreference.getSnapshot, () => false);
  const slug = ambienceSlug(usePathname());
  useEffect(() => {
    document.documentElement.dataset.chaos = String(enabled);
    return () => { delete document.documentElement.dataset.chaos; };
  }, [enabled]);
  if (!enabled) return null;
  return <aside className="chaos-ribbon" aria-label="Chaos Mode decorations">
    <div className="chaos-badge">✦ CHAOS MODE ✦<small>tiny site, big dreams</small></div>
    <span className="chaos-sticker chaos-first" aria-hidden="true">{TRAILS[slug].glyph}</span>
    <span className="chaos-sticker chaos-second" aria-hidden="true">✉</span>
    <p className="chaos-message">Welcome to my little corner of the dreamnet!</p>
    <span className="chaos-sticker chaos-third" aria-hidden="true">☾</span>
    <span className="chaos-sticker chaos-fourth" aria-hidden="true">★</span>
    <span className="chaos-stamp">100% handmade dreams</span>
  </aside>;
}
