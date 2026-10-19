"use client";

import { useSyncExternalStore } from "react";
import { chaosPreference, nightPreference } from "@/lib/site-preferences";
import { soundSettings } from "@/lib/sound-settings";
import styles from "./SiteControls.module.css";

export function SiteControls() {
  const sound = useSyncExternalStore(soundSettings.subscribe, soundSettings.getPreference, () => false);
  const chaos = useSyncExternalStore(chaosPreference.subscribe, chaosPreference.getSnapshot, () => false);
  const night = useSyncExternalStore(nightPreference.subscribe, nightPreference.getSnapshot, () => false);
  return <div className={styles.controls} aria-label="Site effects">
    <button type="button" aria-label={sound ? "Turn sound off" : "Turn sound on"} aria-pressed={sound} title={sound ? "Turn sound off" : "Turn sound on"} onClick={() => soundSettings.setEnabled(!sound)}>
      <span aria-hidden="true">{sound ? "🔊" : "🔇"}</span><span className={styles.label}>Sound</span>
    </button>
    <button type="button" aria-label={chaos ? "Turn Chaos Mode off" : "Turn Chaos Mode on"} aria-pressed={chaos} title="Chaos Mode" onClick={() => chaosPreference.set(!chaos)}>
      <span aria-hidden="true">✦</span><span className={styles.label}>Chaos</span>
    </button>
    <button type="button" aria-label={night ? "Switch to day palette" : "Switch to night palette"} aria-pressed={night} title={night ? "Day palette" : "Night palette"} onClick={() => nightPreference.set(!night)}>
      <span aria-hidden="true">{night ? "☀" : "☾"}</span><span className={styles.label}>Palette</span>
    </button>
  </div>;
}
