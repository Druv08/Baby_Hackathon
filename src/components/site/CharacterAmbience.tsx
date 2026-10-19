"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { AMBIENCE, SOUND_STORAGE_KEY, ambienceSlug } from "@/lib/ambience";
import styles from "./CharacterAmbience.module.css";

// One shared sound preference for the whole site (off until turned on).
const listeners = new Set<() => void>();
function readSound(): boolean {
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}
function setSound(on: boolean) {
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Storage blocked: the setting simply won't be remembered.
  }
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const CLICKABLE = "button, a[href], [role='button'], summary, input[type='checkbox'], input[type='radio'], select";

/**
 * Character ambience for the current page: the matching paw cursor, click
 * sound and background music. Music only plays after the visitor turns
 * sound on (browsers block autoplay); one track at a time, switched or
 * stopped as the visitor moves between characters.
 */
export function CharacterAmbience() {
  const slug = ambienceSlug(usePathname());
  const ambience = AMBIENCE[slug];
  const soundOn = useSyncExternalStore(subscribe, readSound, () => false);
  const music = useRef<HTMLAudioElement | null>(null);
  const clicks = useRef(new Map<string, HTMLAudioElement>());
  const current = useRef({ click: ambience.click, soundOn });
  current.current = { click: ambience.click, soundOn };

  // Paw cursor for this character (pointer devices only, via CSS).
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.paw = slug;
    root.style.setProperty("--paw-cursor", `url("${ambience.cursor}")`);
  }, [slug, ambience.cursor]);

  // One click listener for the whole site; it reads the current character.
  useEffect(() => {
    let last = 0;
    function onClick(e: MouseEvent) {
      const { click, soundOn: on } = current.current;
      if (!on || !(e.target instanceof Element) || !e.target.closest(CLICKABLE)) return;
      const now = performance.now();
      if (now - last < 70) return; // ignore rapid repeats
      last = now;
      let audio = clicks.current.get(click);
      if (!audio) {
        audio = new Audio(click);
        audio.volume = 0.5;
        clicks.current.set(click, audio);
      }
      // Restart the same element instead of stacking new ones.
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    }
    document.addEventListener("click", onClick);
    const cache = clicks.current;
    return () => {
      document.removeEventListener("click", onClick);
      cache.forEach((a) => a.pause());
    };
  }, []);

  // Background music: one element, switched per character, only when sound is on.
  useEffect(() => {
    const audio = music.current;
    if (!audio) return;
    if (!soundOn) {
      audio.pause();
      return;
    }
    if (audio.getAttribute("src") !== ambience.music) {
      audio.pause();
      audio.src = ambience.music;
      audio.currentTime = 0;
    }
    audio.volume = 0.3;
    void audio.play().catch(() => {});
  }, [soundOn, ambience.music]);

  // Stop everything if the site shell unmounts.
  useEffect(() => {
    const audio = music.current;
    return () => {
      audio?.pause();
      audio?.removeAttribute("src");
    };
  }, []);

  return (
    <>
      <audio ref={music} loop preload="none" data-character={slug} aria-hidden="true" />
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
        onClick={() => setSound(!soundOn)}
      >
        <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>
        <span className={styles.label}>{soundOn ? "Sound on" : "Sound off"}</span>
      </button>
    </>
  );
}
