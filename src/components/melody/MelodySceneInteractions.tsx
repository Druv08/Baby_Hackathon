"use client";
import { useEffect, useRef, useState } from "react";
import { MOOD_TRACKS, NOTES, type Mood, type Note } from "@/lib/projects/melody";
import { SoundControl } from "./MusicalControls";
import { useMelodyAudio } from "./useMelodyAudio";
import styles from "./Melody.module.css";

const PREVIEW_SECONDS = 12;

/** Plays a short preview of a real mood song: one at a time, faded in and out, stopped on leave or sound off. */
function useMoodPreview(enabled: boolean) {
  const player = useRef<HTMLAudioElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout | typeof setInterval>[]>([]);
  const ducked = useRef(false);
  const request = useRef(0); // the newest play() wins; older ones are ignored
  const [playing, setPlaying] = useState<Mood | null>(null);
  const duck = (on: boolean) => {
    if (ducked.current === on) return;
    ducked.current = on;
    window.dispatchEvent(new CustomEvent("maria:duck", { detail: on }));
  };
  const clear = () => { timers.current.forEach(t => { clearTimeout(t); clearInterval(t); }); timers.current = []; };
  const stop = () => {
    clear();
    player.current?.pause();
    duck(false);
    setPlaying(null);
  };
  const stopRef = useRef(stop);
  stopRef.current = stop;
  // Steps the volume towards a target over about a second.
  const fade = (audio: HTMLAudioElement, to: number, done?: () => void) => {
    const step = (to - audio.volume) / 10;
    let n = 0;
    const t = setInterval(() => {
      audio.volume = Math.min(1, Math.max(0, audio.volume + step));
      if (++n >= 10) { clearInterval(t); done?.(); }
    }, 100);
    timers.current.push(t);
  };
  const play = (mood: Mood) => {
    stop();
    const ticket = ++request.current;
    const audio = (player.current ??= new Audio());
    audio.src = MOOD_TRACKS[mood];
    audio.currentTime = 0;
    audio.volume = 0;
    duck(true);
    setPlaying(mood);
    // Switching songs aborts the previous play(); only this request's outcome counts.
    void audio.play().then(() => { if (ticket === request.current) fade(audio, 0.6); }).catch(() => { if (ticket === request.current) stopRef.current(); });
    timers.current.push(setTimeout(() => fade(audio, 0, () => stopRef.current()), (PREVIEW_SECONDS - 1) * 1000));
  };
  useEffect(() => { if (!enabled) stopRef.current(); }, [enabled]);
  useEffect(() => {
    const hide = () => { if (document.hidden) stopRef.current(); };
    document.addEventListener("visibilitychange", hide);
    const audio = player;
    return () => {
      document.removeEventListener("visibilitychange", hide);
      stopRef.current();
      audio.current?.removeAttribute("src");
    };
  }, []);
  return { play, stop, playing };
}

export function MelodySceneInteraction({ id }: { id: string }) {
  const audio = useMelodyAudio();
  const preview = useMoodPreview(audio.enabled);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState<Note[]>([]);
  return <div ref={audio.region} className={`${styles.activity} ${styles.scene}`}>
    <div className={styles.toolbar}><SoundControl audio={audio} /></div>
    {id === "melody-chime" && <button type="button" data-active={selected === "chime"} onClick={() => { preview.stop(); setSelected("chime"); audio.play(["G", "E"], "Gentle bell"); setMessage("♪ A faint chime… music once filled this village."); }}>Ring the wind chime ♫</button>}
    {(id === "melody-guitar" || id === "melody-build") && <>
      <p>{id === "melody-guitar" ? "Pluck a string and watch its note glow." : "Choose four notes to share a comforting lullaby."}</p>
      <div className={styles.toolbar}>{NOTES.map(note => <button key={note} type="button" aria-pressed={selected === note} onClick={() => {
        setSelected(note); void audio.tone(note, "Recorded guitar");
        if (id === "melody-build") { const next = [...score, note].slice(-4); setScore(next); if (next.length === 4) { audio.play(next, "Recorded guitar", 650); setMessage("✦ Your four notes light up the village. Every little song can carry kindness."); } }
      }}>♪ {note}</button>)}</div>
      {id === "melody-build" && <><p aria-live="polite">Your melody: {score.join(" → ") || "Choose your first note"}</p><button type="button" onClick={() => { audio.stop(); setScore([]); setMessage(""); }}>Reset notes</button></>}
    </>}
    {id === "melody-mood" && <><p>What kind of song might comfort the bunny tonight?</p><div className={styles.toolbar}>{(["Cheerful", "Energetic", "Gentle"] as const).map(mood => <button key={mood} type="button" aria-pressed={selected === mood} onClick={() => {
      setSelected(mood); const pattern: Note[] = mood === "Gentle" ? ["E", "D", "C"] : mood === "Cheerful" ? ["C", "E", "G"] : ["G", "A", "G", "E"];
      // With sound on, hear a short preview of the real song; otherwise the notes glow silently.
      if (audio.enabled) { audio.stop(); preview.play(mood); } else audio.play(pattern, "Soft piano", mood === "Energetic" ? 220 : 550);
      setMessage(`${pattern.join(" → ")} — ${mood === "Gentle" ? "A gentle song offers the comfort the bunny needs tonight." : mood + " music can be wonderful. Tonight, the bunny is asking for calm and familiar comfort."}`);
    }}>{mood}</button>)}</div>
      {preview.playing && <button type="button" onClick={preview.stop}>Stop the {preview.playing.toLowerCase()} song ■</button>}</>}
    {id === "melody-reveal" && <button type="button" onClick={() => { audio.play(["C", "E", "G", "A", "G"]); setMessage("♫ Every heart has a little song waiting to be heard."); }}>Celebrate Melody’s first lullaby ✦</button>}
    <p role="status">{audio.active >= 0 ? `♪ Playing note ${audio.active + 1}. ` : ""}{preview.playing ? `♫ Playing a little of the ${preview.playing.toLowerCase()} song. ` : ""}{message}</p>
  </div>;
}

export function MelodyLayer() {
  return <div className={styles.ambient} aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ left: `${(i * 37) % 98}%`, top: `${(i * 23) % 95}%`, animationDelay: `${i * -.8}s` }}>{i % 3 ? "♪" : "✦"}</span>)}</div>;
}
