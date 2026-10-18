"use client";

import { useSyncExternalStore } from "react";

import { SECRET_ENDING } from "@/data/secrets";
import { getFoundSecrets, isSecretEndingUnlocked } from "@/lib/easter-eggs";
import { getWelcomeMessage, isStoryComplete } from "@/lib/progress/model";
import { progressStore, type ProgressStore } from "@/lib/progress/store";

const subscribeNoop = () => () => {};

/** True after hydration; false during SSR and the hydration render. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

/**
 * Visitor progress for client components. Renders default (empty) progress
 * on the server and during hydration, then the saved progress — use
 * `hydrated` to avoid flashing "first visit" UI to returning visitors.
 */
export function useJourneyProgress(store: ProgressStore = progressStore) {
  const progress = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const hydrated = useHydrated();
  const secretEndingUnlocked = isSecretEndingUnlocked(progress);

  return {
    progress,
    hydrated,
    welcomeMessage: getWelcomeMessage(progress),
    discoveredCount: progress.discoveredForms.length,
    completedCount: progress.completedStories.length,
    isStoryComplete: (futureId: number) => isStoryComplete(progress, futureId),

    foundSecrets: getFoundSecrets(progress),
    secretCount: progress.easterEggsFound.length,
    secretEndingUnlocked,
    secretEnding: secretEndingUnlocked ? SECRET_ENDING : null,

    discoverFuture: store.discoverFuture,
    completeStory: store.completeStory,
    setVisitorName: store.setVisitorName,
    collectSecret: store.collectSecret,
    resetProgress: store.reset,
  };
}
