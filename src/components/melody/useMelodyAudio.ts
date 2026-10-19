"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FREQUENCIES, NOTES, RECORDED_NOTE_FILES, type Instrument, type Note } from "@/lib/projects/melody";
import { SOUND_STORAGE_KEY } from "@/lib/ambience";

// One optional sound setting shared by all Melody activities. No extra storage:
// it starts from the site-wide sound preference, then the Melody toggle rules.
let sound = false;
let soundInitialised = false;
const listeners = new Set<() => void>();
const stopPlayers = new Set<() => void>();
function subscribe(listener: () => void) {
  if (!soundInitialised && typeof window !== "undefined") {
    soundInitialised = true;
    try {
      sound = window.localStorage.getItem(SOUND_STORAGE_KEY) === "on";
    } catch {
      // Storage unavailable: stay silent until the visitor turns sound on.
    }
  }
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** While Melody plays, the site's background music steps back (see CharacterAmbience). */
function duck(on: boolean) {
  window.dispatchEvent(new CustomEvent("maria:duck", { detail: on }));
}

// Recorded guitar notes: decoded once, trimmed to each note's onset and levelled.
interface Sample { buffer: AudioBuffer; offset: number; gain: number }
let samples: Promise<Record<Note, Sample>> | null = null;
function loadSamples(ctx: BaseAudioContext): Promise<Record<Note, Sample>> {
  samples ??= Promise.all(NOTES.map(async note => {
    const res = await fetch(RECORDED_NOTE_FILES[note]);
    if (!res.ok) throw new Error(`missing ${note}`);
    const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
    const data = buffer.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
    // The pluck is the first moment the sound reaches a third of its peak.
    let onset = 0;
    while (onset < data.length && Math.abs(data[onset]) < peak * 0.35) onset++;
    return [note, { buffer, offset: Math.max(0, onset / buffer.sampleRate - 0.04), gain: peak > 0 ? 0.6 / peak : 1 }] as const;
  })).then(entries => Object.fromEntries(entries) as Record<Note, Sample>).catch(error => { samples = null; throw error; });
  return samples;
}

export function useMelodyAudio() {
  const enabled = useSyncExternalStore(subscribe, () => sound, () => false);
  const context = useRef<AudioContext | null>(null);
  const voices = useRef<AudioScheduledSourceNode[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const generation = useRef(0);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState("");
  const region = useRef<HTMLDivElement>(null);
  const stop = useCallback(() => {
    generation.current++;
    timers.current.forEach(clearTimeout); timers.current = [];
    if (voices.current.length) duck(false);
    voices.current.forEach(node => { try { node.stop(); } catch {} node.disconnect(); });
    voices.current = [];
    setActive(-1);
  }, []);

  /** Schedules one note on the audio clock and returns its source node. */
  const schedule = useCallback(async (ctx: AudioContext, note: Note, instrument: Instrument, when: number): Promise<AudioScheduledSourceNode> => {
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    if (instrument === "Recorded guitar") {
      try {
        const sample = (await loadSamples(ctx))[note];
        const source = ctx.createBufferSource();
        source.buffer = sample.buffer;
        const length = 1.4;
        gain.gain.setValueAtTime(sample.gain, when);
        gain.gain.setValueAtTime(sample.gain, when + length - 0.3);
        gain.gain.linearRampToValueAtTime(0.0001, when + length);
        source.connect(gain);
        source.start(when, sample.offset, length);
        source.onended = () => { source.disconnect(); gain.disconnect(); };
        return source;
      } catch {
        setError("The recorded notes couldn’t load, so a soft piano is playing instead.");
        instrument = "Soft piano";
      }
    }
    const oscillator = ctx.createOscillator();
    oscillator.type = instrument === "Soft piano" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(FREQUENCIES[note] * (instrument === "Music box" ? 2 : 1), when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(0.12, when + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, when + (instrument === "Gentle bell" ? 0.8 : 0.4));
    oscillator.connect(gain);
    oscillator.start(when);
    oscillator.stop(when + 0.85);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    return oscillator;
  }, []);

  /** Starts (or resumes) audio inside the user's click; null when sound is off or unavailable. */
  const ready = useCallback(async (): Promise<AudioContext | null> => {
    if (!sound) return null;
    stopPlayers.forEach(stopOther => { if (stopOther !== stop) stopOther(); });
    try {
      const ctx = context.current ?? (context.current = new AudioContext());
      await ctx.resume();
      return ctx.state === "closed" ? null : ctx;
    } catch {
      setError("Sound is unavailable in this browser. You can still follow the glowing notes.");
      return null;
    }
  }, [stop]);

  const tone = useCallback(async (note: Note, instrument: Instrument = "Soft piano") => {
    const ticket = generation.current;
    const ctx = await ready();
    if (!ctx || ticket !== generation.current || !sound) return;
    voices.current.forEach(node => { try { node.stop(); } catch {} node.disconnect(); });
    voices.current = [];
    const node = await schedule(ctx, note, instrument, ctx.currentTime + 0.01);
    if (ticket !== generation.current) { try { node.stop(); } catch {} return; }
    voices.current.push(node);
  }, [ready, schedule]);

  const play = useCallback((notes: readonly Note[], instrument: Instrument = "Soft piano", beat = 500, onStep?: (step: number) => void, onEnd?: () => void) => {
    stop();
    const ticket = generation.current;
    // Glowing steps always run, so every activity works with sound off.
    setActive(0); onStep?.(0);
    notes.slice(1).forEach((_, i) => timers.current.push(setTimeout(() => { setActive(i + 1); onStep?.(i + 1); }, (i + 1) * beat)));
    timers.current.push(setTimeout(() => { stop(); onEnd?.(); }, notes.length * beat));
    // Sound: every note scheduled up front on the audio clock, so the rhythm stays steady.
    void (async () => {
      const ctx = await ready();
      if (!ctx || ticket !== generation.current) return;
      if (instrument === "Recorded guitar") await loadSamples(ctx).catch(() => undefined);
      if (ticket !== generation.current) return;
      const start = ctx.currentTime + 0.05;
      duck(true);
      for (const [i, note] of notes.entries()) {
        const node = await schedule(ctx, note, instrument, start + (i * beat) / 1000);
        if (ticket !== generation.current) { try { node.stop(); } catch {} return; }
        voices.current.push(node);
      }
    })();
  }, [stop, ready, schedule]);

  useEffect(() => {
    stopPlayers.add(stop);
    const silence = () => { if (!sound) stop(); };
    listeners.add(silence);
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hide);
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) stop(); }) : undefined;
    if (region.current) observer?.observe(region.current);
    return () => {
      stopPlayers.delete(stop); listeners.delete(silence); document.removeEventListener("visibilitychange", hide); observer?.disconnect(); stop();
      const ctx = context.current; context.current = null; if (ctx && ctx.state !== "closed") void ctx.close();
    };
  }, [stop]);
  const toggle = () => { sound = !sound; listeners.forEach(listener => listener()); };
  return { enabled, toggle, tone, play, stop, active, error, region };
}
