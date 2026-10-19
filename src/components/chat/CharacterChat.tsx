"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CHARACTERS } from "@/data/characters";
import { themeStyle } from "@/data/future-themes";
import { replyTo } from "@/lib/dialogue";
import type { CharacterSlug } from "@/types/character";
import styles from "./CharacterChat.module.css";

interface Message { speaker: "Maria" | "You"; text: string; href?: string; linkLabel?: string }
const sessions = new Map<CharacterSlug, Message[]>();
const QUESTIONS = ["Who are you?", "Tell me your story", "What do you love doing?", "Can you help me?", "What did you learn?", "Tell me a secret"];

export default function CharacterChat({ slug, onClose }: { slug: CharacterSlug; onClose: () => void }) {
  const character = CHARACTERS.find(item => item.slug === slug)!;
  const [messages, setMessages] = useState<Message[]>(() => sessions.get(slug) ?? [{ speaker: "Maria", ...replyTo(slug, "Hello") }]);
  const [input, setInput] = useState(""), [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null), field = useRef<HTMLInputElement>(null), log = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => { const element = dialog.current; element?.showModal(); field.current?.focus(); return () => element?.close(); }, []);
  useEffect(() => { sessions.set(slug, messages); log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "instant" }); }, [messages, slug]);
  function ask(text: string) {
    const question = text.trim();
    if (!question) { setError("Write a little question, or choose one below."); field.current?.focus(); return; }
    if ([...question].length > 280) { setError("Keep your question to 280 characters."); return; }
    setMessages(previous => [...previous, { speaker: "You" as const, text: question }, { speaker: "Maria" as const, ...replyTo(slug, question, Math.floor(previous.length / 2)) }].slice(-40));
    setInput(""); setError(""); field.current?.focus();
  }
  return <dialog ref={dialog} className={styles.dialog} style={themeStyle(slug)} aria-labelledby={`${id}-title`} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <header className={styles.header}><Image src={character.characterImage} alt="" width={54} height={72} /><div><h2 id={`${id}-title`}>{character.name}</h2><p>Little conversations, written for each Maria</p></div><button type="button" className={styles.close} aria-label="Close conversation" onClick={() => dialog.current?.close()}>×</button></header>
    <div ref={log} className={styles.log} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">{messages.map((message, index) => <div className={styles.bubble} data-speaker={message.speaker} key={index}><strong>{message.speaker === "Maria" ? character.name : "You"}</strong><p>{message.text}</p>{message.href && <Link href={message.href} onClick={() => dialog.current?.close()}>{message.linkLabel}</Link>}</div>)}</div>
    <div className={styles.suggestions} aria-label="Suggested questions">{QUESTIONS.map(question => <button type="button" key={question} onClick={() => ask(question)}>{question}</button>)}</div>
    <form noValidate className={styles.form} onSubmit={event => { event.preventDefault(); ask(input); }}><label htmlFor={`${id}-input`}>Your question</label><div><input ref={field} id={`${id}-input`} value={input} maxLength={280} autoComplete="off" aria-invalid={!!error} aria-describedby={`${id}-help`} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault(); }} /><button type="submit" className="btn btn-primary">Send</button></div><p id={`${id}-help`} role={error ? "alert" : undefined}>{error || "Authored replies. Your conversation stays in this browser session."}</p></form>
  </dialog>;
}
