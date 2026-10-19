"use client";

import { useState, type CSSProperties } from "react";
import { checkFlower, DEFAULT_SCORE, makeFlowerSequence, MELODIES, NOTES, type Instrument, type Note } from "@/lib/projects/melody";
import { SoundControl } from "./MusicalControls";
import { useMelodyAudio } from "./useMelodyAudio";
import styles from "./Melody.module.css";

export function LullabyLab() {
  const audio = useMelodyAudio();
  const [score, setScore] = useState<Note[]>([...DEFAULT_SCORE]);
  const [instrument, setInstrument] = useState<Instrument>("Soft piano");
  return <div className={styles.activity} ref={audio.region}>
    <p>Choose a note for each of eight steps, pick an instrument, then play your lullaby. Glowing steps show the melody even with sound off.</p>
    <div className={styles.toolbar}><SoundControl audio={audio} />
      <label>Instrument <select value={instrument} onChange={e => { audio.stop(); setInstrument(e.target.value as Instrument); }}>{["Soft piano", "Music box", "Gentle bell"].map(name => <option key={name}>{name}</option>)}</select></label>
    </div>
    <div className={styles.score}>{score.map((note, index) => <label className={styles.step} key={index} data-active={audio.active === index}>
      Step {index + 1}<select aria-label={`Step ${index + 1} note`} value={note} onChange={e => { audio.stop(); setScore(score.map((n, i) => i === index ? e.target.value as Note : n)); }}>{NOTES.map(n => <option key={n}>{n}</option>)}</select>
    </label>)}</div>
    <div className={styles.toolbar}><button type="button" onClick={() => audio.play(score, instrument)}>Play melody</button><button type="button" onClick={audio.stop}>Stop</button><button type="button" onClick={() => { audio.stop(); setScore([...DEFAULT_SCORE]); setInstrument("Soft piano"); }}>Reset composition</button></div>
    <p role="status">{audio.active < 0 ? "Your lullaby is ready to play." : `Step ${audio.active + 1}: ${score[audio.active]}`}</p>
  </div>;
}

const FLOWERS = ["Rose", "Sunflower", "Bluebell", "Lavender"];
const COLORS = ["#f3b3cc", "#f6d37f", "#a9cfea", "#cdb8f0"];
export function RhythmGarden() {
  const audio = useMelodyAudio();
  const [difficulty, setDifficulty] = useState(0);
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [answer, setAnswer] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "watch" | "answer" | "won" | "wrong">("idle");
  const [glow, setGlow] = useState(-1);
  const [message, setMessage] = useState("Start a round, watch the flowers, then repeat their order.");
  function show(pattern: number[]) {
    setPhase("watch"); setAnswer([]); setMessage("Watch the glowing flowers. Your turn follows the last note.");
    audio.play(pattern.map(i => NOTES[i]), "Gentle bell", 750, i => setGlow(pattern[i]), () => { setGlow(-1); setPhase("answer"); setMessage("Your turn! Repeat the flower order."); });
  }
  function reset() { audio.stop(); setSequence([]); setAnswer([]); setPhase("idle"); setGlow(-1); setRound(1); setMessage("Start a new round when you are ready."); }
  return <div ref={audio.region} className={styles.activity}>
    <div className={styles.toolbar}><SoundControl audio={audio} />
      <label>Difficulty <select value={difficulty} onChange={e => { reset(); setDifficulty(Number(e.target.value)); }}>{["Easy", "Medium", "Hard"].map((d, i) => <option key={d} value={i}>{d}</option>)}</select></label>
    </div>
    <p>Round {round} · {sequence.length || difficulty + 2} notes · Blooms earned: {Math.max(0, round - 1) + (phase === "won" ? 1 : 0)}</p>
    <div className={styles.flowers}>{FLOWERS.map((flower, i) => <button key={flower} type="button" style={{ "--flower": COLORS[i] } as CSSProperties} data-active={phase === "watch" ? audio.active >= 0 && sequence[audio.active] === i : glow === i} disabled={phase !== "answer"} onClick={() => {
      setGlow(i); void audio.tone(NOTES[i], "Gentle bell"); const next = [...answer, i]; setAnswer(next);
      const result = checkFlower(sequence, next);
      if (result === "wrong") { setPhase("wrong"); setMessage("That flower was different. Replay the same sequence and try again."); }
      else if (result === "complete") { setPhase("won"); setMessage("The garden blooms! Start the next round for a longer melody."); }
      else setMessage(`${next.length} of ${sequence.length} flowers matched.`);
    }}><span key={`${i}-${audio.active}`} className={`${styles.flower} ${phase === "watch" && sequence[audio.active] === i ? styles.pulse : ""}`} aria-hidden="true">✿</span>{flower} · {NOTES[i]}</button>)}</div>
    <div className={styles.toolbar}>
      <button type="button" disabled={phase === "watch" || phase === "answer"} onClick={() => { const nextRound = phase === "won" ? round + 1 : round; setRound(nextRound); const pattern = makeFlowerSequence(Math.min(12, difficulty + nextRound + 1)); setSequence(pattern); show(pattern); }}>{phase === "won" ? "Next round" : "Start round"}</button>
      <button type="button" disabled={!sequence.length} onClick={() => show(sequence)}>Replay sequence</button>
      <button type="button" onClick={reset}>Reset garden</button>
    </div>
    <p role="status">{phase === "watch" && audio.active >= 0 ? `${FLOWERS[sequence[audio.active]]} (${audio.active + 1}/${sequence.length}). ` : ""}{message}</p>
    {phase === "watch" && audio.active < 0 && <button type="button" onClick={() => show(sequence)}>Resume sequence</button>}
  </div>;
}

const LIGHTS: Record<string, string> = { "Warm Gold": "#f6d37f", "Soft Pink": "#f3b3cc", Lavender: "#cdb8f0", "Moonlight Blue": "#a9cfea" };
export function MoonlightMusicBox() {
  const audio = useMelodyAudio();
  const [shape, setShape] = useState("Crescent Moon Box");
  const [melody, setMelody] = useState("Gentle Moonlight");
  const [lighting, setLighting] = useState("Warm Gold");
  const [open, setOpen] = useState(false);
  return <div ref={audio.region} className={styles.activity}>
    <p>Choose a shape, melody and lantern color. Open your music box to reveal a tiny dream village, then press play.</p>
    <div className={styles.toolbar}><SoundControl audio={audio} /></div>
    <fieldset><legend>Music box shape</legend><div className={styles.toolbar}>{["Crescent Moon Box", "Star Box", "Flower Box"].map(name => <button key={name} type="button" aria-pressed={shape === name} onClick={() => setShape(name)}>{name}</button>)}</div></fieldset>
    <fieldset><legend>Melody</legend><div className={styles.toolbar}>{Object.keys(MELODIES).map(name => <button key={name} type="button" aria-pressed={melody === name} onClick={() => { audio.stop(); setMelody(name); }}>{name}</button>)}</div></fieldset>
    <fieldset><legend>Lighting</legend><div className={styles.toolbar}>{Object.keys(LIGHTS).map(name => <button key={name} type="button" aria-pressed={lighting === name} onClick={() => setLighting(name)}>{name}</button>)}</div></fieldset>
    <div className={styles.preview} role="img" aria-label={`${open ? "Open" : "Closed"} ${shape}, ${lighting} lighting${open ? ", with stars over a tiny moonlit village" : ""}`}>
      <div className={styles.box} data-shape={shape} style={{ "--light": LIGHTS[lighting] } as CSSProperties}>
        {open ? <div><div className={styles.dream} aria-hidden="true">✦ ☾ ✦<br />⌂ ♫ ⌂</div><span>A little village of dreams</span></div> : <span>{shape === "Star Box" ? "✦" : shape === "Flower Box" ? "✿" : "☾"} A dream waits inside</span>}
      </div>
    </div>
    <div className={styles.toolbar}>
      <button type="button" aria-expanded={open} onClick={() => { audio.stop(); setOpen(!open); }}>{open ? "Close music box" : "Open music box"}</button>
      <button type="button" disabled={!open} onClick={() => audio.play(MELODIES[melody], "Music box", 600)}>Play selected melody</button>
      <button type="button" onClick={audio.stop}>Stop</button>
      <button type="button" onClick={() => { audio.stop(); setOpen(false); setShape("Crescent Moon Box"); setMelody("Gentle Moonlight"); setLighting("Warm Gold"); }}>Reset music box</button>
    </div>
    <p role="status">{audio.active >= 0 ? `${melody}: ${MELODIES[melody][audio.active]} ♪` : open ? "Your dream village is open. Press play when you are ready." : "Open the box to see your dream village."}</p>
  </div>;
}

/** Missing project illustrations use a miniature of the real interactive preview. */
export function MusicBoxThumbnail() { return <svg viewBox="0 0 320 180" role="img" aria-label="Moonlit music box preview"><rect width="320" height="180" fill="#2a1f4a"/><path d="M75 85 Q160 25 245 85 V145 Q160 170 75 145Z" fill="#cdb8f0" stroke="#f6c56b" strokeWidth="4"/><text x="160" y="120" textAnchor="middle" fontSize="50" fill="#45263c">☾ ♫ ✦</text></svg>; }
export function GardenThumbnail() { return <svg viewBox="0 0 320 180" role="img" aria-label="Four musical flowers preview"><rect width="320" height="180" fill="#2a1f4a"/>{COLORS.map((color,i) => <g key={color}><path d={`M${55+i*70} 110V170`} stroke="#a4c68b" strokeWidth="5"/><text x={55+i*70} y="110" textAnchor="middle" fill={color} fontSize="55">✿</text><text x={55+i*70} y="145" textAnchor="middle" fill="white">{NOTES[i]}</text></g>)}</svg>; }
