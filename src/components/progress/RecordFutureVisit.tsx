"use client";

import { useEffect, useState } from "react";

import { progressStore } from "@/lib/progress/store";
import { CHARACTERS } from "@/data/characters";

/** Marks a future as discovered when its page is opened. Renders nothing. */
export function RecordFutureVisit({ futureId }: { futureId: number }) {
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    const saved = progressStore.getSnapshot();
    const character = CHARACTERS.find(item => item.id === futureId);
    if (character && (saved.discoveredForms as number[]).includes(futureId)) {
      const name = saved.visitorName ? `, ${saved.visitorName}` : "";
      setGreeting((saved.completedStories as number[]).includes(futureId)
        ? `Welcome back${name}! You finished ${character.name}’s story. What will you create together next?`
        : `Hello again${name}! Ready to explore another little dream with ${character.name}?`);
    }
    progressStore.discoverFuture(futureId);
  }, [futureId]);
  return greeting ? <p className="container returning-greeting" role="status">{greeting}</p> : null;
}
