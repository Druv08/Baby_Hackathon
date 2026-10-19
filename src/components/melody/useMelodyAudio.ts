"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FREQUENCIES, type Instrument, type Note } from "@/lib/projects/melody";

// One optional sound setting shared by all Melody activities. No extra storage.
let sound = false;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function useMelodyAudio() {
  const enabled = useSyncExternalStore(subscribe, () => sound, () => false);
  const context = useRef<AudioContext | null>(null);
  const voices = useRef<OscillatorNode[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const generation = useRef(0);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState("");
  const region = useRef<HTMLDivElement>(null);
  const stop = useCallback(() => {
    generation.current++;
    timers.current.forEach(clearTimeout); timers.current = [];
    voices.current.forEach(node => { try { node.stop(); } catch {} node.disconnect(); });
    voices.current = [];
    setActive(-1);
  }, []);
  const tone = useCallback(async (note: Note, instrument: Instrument = "Soft piano") => {
    if (!sound) return;
    const ticket = generation.current;
    try {
      const ctx = context.current ?? (context.current = new AudioContext());
      await ctx.resume();
      if (ticket !== generation.current || !sound || ctx.state === "closed") return;
      voices.current.forEach(node => { try { node.stop(); } catch {} node.disconnect(); });
      voices.current = [];
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = instrument === "Soft piano" ? "triangle" : "sine";
      oscillator.frequency.value = FREQUENCIES[note] * (instrument === "Music box" ? 2 : 1);
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (instrument === "Gentle bell" ? 0.8 : 0.4));
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(); oscillator.stop(now + 0.85);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); voices.current = voices.current.filter(n => n !== oscillator); };
      voices.current.push(oscillator);
    } catch { setError("Sound is unavailable in this browser. You can still follow the glowing notes."); }
  }, []);
  const play = useCallback((notes: readonly Note[], instrument: Instrument = "Soft piano", beat = 500, onStep?: (step: number) => void, onEnd?: () => void) => {
    stop();
    // Start/resume inside the user gesture, before any timers.
    void tone(notes[0], instrument);
    setActive(0); onStep?.(0);
    notes.slice(1).forEach((note, i) => timers.current.push(setTimeout(() => {
      setActive(i + 1); onStep?.(i + 1); void tone(note, instrument);
    }, (i + 1) * beat)));
    timers.current.push(setTimeout(() => { stop(); onEnd?.(); }, notes.length * beat));
  }, [stop, tone]);
  useEffect(() => {
    const silence = () => { if (!sound) stop(); };
    listeners.add(silence);
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hide);
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) stop(); }) : undefined;
    if (region.current) observer?.observe(region.current);
    return () => {
      listeners.delete(silence); document.removeEventListener("visibilitychange", hide); observer?.disconnect(); stop();
      const ctx = context.current; context.current = null; if (ctx && ctx.state !== "closed") void ctx.close();
    };
  }, [stop]);
  const toggle = () => { sound = !sound; listeners.forEach(listener => listener()); };
  return { enabled, toggle, tone, play, stop, active, error, region };
}
