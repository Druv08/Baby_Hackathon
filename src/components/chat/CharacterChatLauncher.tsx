"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { CharacterSlug } from "@/types/character";
const Panel = dynamic(() => import("./CharacterChat"), { ssr: false, loading: () => <p role="status">Opening Maria’s conversation…</p> });

export function CharacterChatLauncher({ slug }: { slug: CharacterSlug }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return <><button type="button" ref={button} className="btn btn-secondary" data-chat-launcher aria-haspopup="dialog" onClick={() => setOpen(true)}>Talk to Maria</button>
    {open && <Panel key={slug} slug={slug} onClose={() => { setOpen(false); button.current?.focus(); }} />}</>;
}
