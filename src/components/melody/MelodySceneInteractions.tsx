"use client";
import { useState } from "react";
import { NOTES, type Note } from "@/lib/projects/melody";
import { SoundControl } from "./MusicalControls";
import { useMelodyAudio } from "./useMelodyAudio";
import styles from "./Melody.module.css";

export function MelodySceneInteraction({ id }: { id: string }) {
  const audio = useMelodyAudio();
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState<Note[]>([]);
  return <div ref={audio.region} className={`${styles.activity} ${styles.scene}`}>
    <div className={styles.toolbar}><SoundControl audio={audio} /></div>
    {id === "melody-chime" && <button type="button" data-active={selected === "chime"} onClick={() => { setSelected("chime"); audio.play(["G", "E"], "Gentle bell"); setMessage("♪ A faint chime… music once filled this village."); }}>Ring the wind chime ♫</button>}
    {(id === "melody-guitar" || id === "melody-build") && <>
      <p>{id === "melody-guitar" ? "Pluck a string and watch its note glow." : "Choose four notes to share a comforting lullaby."}</p>
      <div className={styles.toolbar}>{NOTES.map(note => <button key={note} type="button" aria-pressed={selected === note} onClick={() => {
        setSelected(note); void audio.tone(note);
        if (id === "melody-build") { const next = [...score, note].slice(-4); setScore(next); if (next.length === 4) { audio.play(next); setMessage("✦ Your four notes light up the village. Every little song can carry kindness."); } }
      }}>♪ {note}</button>)}</div>
      {id === "melody-build" && <><p aria-live="polite">Your melody: {score.join(" → ") || "Choose your first note"}</p><button type="button" onClick={() => { audio.stop(); setScore([]); setMessage(""); }}>Reset notes</button></>}
    </>}
    {id === "melody-mood" && <><p>What kind of song might comfort the bunny tonight?</p><div className={styles.toolbar}>{["Cheerful", "Energetic", "Gentle"].map(mood => <button key={mood} type="button" aria-pressed={selected === mood} onClick={() => {
      setSelected(mood); const pattern: Note[] = mood === "Gentle" ? ["E", "D", "C"] : mood === "Cheerful" ? ["C", "E", "G"] : ["G", "A", "G", "E"];
      audio.play(pattern, "Soft piano", mood === "Energetic" ? 220 : 550);
      setMessage(`${pattern.join(" → ")} — ${mood === "Gentle" ? "A gentle song offers the comfort the bunny needs tonight." : mood + " music can be wonderful. Tonight, the bunny is asking for calm and familiar comfort."}`);
    }}>{mood}</button>)}</div></>}
    {id === "melody-reveal" && <button type="button" onClick={() => { audio.play(["C", "E", "G", "A", "G"]); setMessage("♫ Every heart has a little song waiting to be heard."); }}>Celebrate Melody’s first lullaby ✦</button>}
    <p role="status">{audio.active >= 0 ? `♪ Playing note ${audio.active + 1}. ` : ""}{message}</p>
  </div>;
}

export function MelodyLayer() {
  return <div className={styles.ambient} aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ left: `${(i * 37) % 98}%`, top: `${(i * 23) % 95}%`, animationDelay: `${i * -.8}s` }}>{i % 3 ? "♪" : "✦"}</span>)}</div>;
}
