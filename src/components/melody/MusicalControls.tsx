"use client";
import { useMelodyAudio } from "./useMelodyAudio";
export function SoundControl({ audio }: { audio: ReturnType<typeof useMelodyAudio> }) {
  return <><button type="button" aria-pressed={audio.enabled} onClick={audio.toggle}>Sound {audio.enabled ? "on" : "off"}</button>{audio.error && <p role="status">{audio.error}</p>}</>;
}
