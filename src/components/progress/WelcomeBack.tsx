"use client";

import { useJourneyProgress } from "@/hooks/useJourneyProgress";

/** Greets returning visitors. Renders nothing on the server or for first visits. */
export function WelcomeBack({ className }: { className?: string }) {
  const { hydrated, welcomeMessage } = useJourneyProgress();
  if (!hydrated || !welcomeMessage) return null;
  return (
    <p className={className} role="status">
      <span aria-hidden="true">✨ </span>
      {welcomeMessage}
    </p>
  );
}
