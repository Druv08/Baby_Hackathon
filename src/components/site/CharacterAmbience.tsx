"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { AMBIENCE, ambienceSlug } from "@/lib/ambience";
import { soundSettings } from "@/lib/sound-settings";

const CLICKABLE = "button, a[href], [role='button'], summary, input[type='checkbox'], input[type='radio'], select";

/** Preserves the team's assets; the header and Melody share this one mute setting. */
export function CharacterAmbience() {
  const slug = ambienceSlug(usePathname());
  const ambience = AMBIENCE[slug];
  const enabled = useSyncExternalStore(soundSettings.subscribe, soundSettings.getEnabled, () => false);
  const music = useRef<HTMLAudioElement>(null);
  const clicks = useRef(new Map<string, HTMLAudioElement>());
  const clickSource = useRef(ambience.click);
  clickSource.current = ambience.click;

  useEffect(() => {
    document.documentElement.dataset.paw = slug;
    document.documentElement.style.setProperty("--paw-cursor", `url("${ambience.cursor}")`);
  }, [slug, ambience.cursor]);

  useEffect(() => {
    let last = -Infinity;
    const cache = clicks.current;
    const activate = (event: Event) => { if (event.isTrusted) soundSettings.activate(); };
    function onClick(event: MouseEvent) {
      if (!soundSettings.getEnabled() || !(event.target instanceof Element)) return;
      if (!event.target.closest(CLICKABLE) || event.target.closest("[data-melody-audio]")) return;
      const now = performance.now();
      if (now - last < 70) return;
      last = now;
      cache.forEach(audio => audio.pause());
      const src = clickSource.current;
      let audio = cache.get(src);
      if (!audio) { audio = new Audio(src); audio.volume = .5; cache.set(src, audio); }
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    }
    document.addEventListener("pointerdown", activate, { capture: true, passive: true });
    document.addEventListener("keydown", activate, true);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerdown", activate, true);
      document.removeEventListener("keydown", activate, true);
      document.removeEventListener("click", onClick);
      cache.forEach(audio => { audio.pause(); audio.removeAttribute("src"); });
      cache.clear();
    };
  }, []);

  useEffect(() => {
    const audio = music.current;
    if (!audio) return;
    clicks.current.forEach(click => click.pause());
    audio.pause();
    if (!enabled) return;
    if (audio.getAttribute("src") !== ambience.music) {
      audio.src = ambience.music;
      audio.currentTime = 0;
    }
    audio.volume = .3;
    const play = () => {
      if (!document.hidden && soundSettings.getEnabled()) void audio.play().catch(() => {});
      else { audio.pause(); clicks.current.forEach(click => click.pause()); }
    };
    play();
    document.addEventListener("visibilitychange", play);
    return () => { document.removeEventListener("visibilitychange", play); audio.pause(); };
  }, [enabled, ambience.music]);

  useEffect(() => {
    const onDuck = (event: Event) => { if (music.current) music.current.volume = (event as CustomEvent<boolean>).detail ? .05 : .3; };
    window.addEventListener("maria:duck", onDuck);
    const audio = music.current;
    return () => { window.removeEventListener("maria:duck", onDuck); audio?.pause(); audio?.removeAttribute("src"); };
  }, []);

  return <audio ref={music} loop preload="none" data-character={slug} data-background-audio aria-hidden="true" />;
}
