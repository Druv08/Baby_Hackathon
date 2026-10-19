"use client";

import { useEffect, useSyncExternalStore } from "react";
import { nightPreference } from "@/lib/site-preferences";
import "./PaletteTheme.css";

export function PaletteTheme() {
  const night = useSyncExternalStore(nightPreference.subscribe, nightPreference.getSnapshot, () => false);
  useEffect(() => {
    document.documentElement.dataset.palette = night ? "night" : "day";
    return () => { delete document.documentElement.dataset.palette; };
  }, [night]);
  return null;
}
