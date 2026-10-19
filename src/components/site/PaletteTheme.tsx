"use client";

import { useEffect, useSyncExternalStore } from "react";
import { nightPreference } from "@/lib/site-preferences";
import "./PaletteTheme.css";

export function PaletteTheme() {
  const night = useSyncExternalStore(nightPreference.subscribe, nightPreference.getSnapshot, () => false);
  useEffect(() => {
    // Hydration's server snapshot is day; keep the pre-paint stored palette until
    // the external-store subscription has caught up, without a one-frame flash.
    document.documentElement.dataset.palette = nightPreference.getSnapshot() ? "night" : "day";
  }, [night]);
  return null;
}
