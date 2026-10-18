import Link from "next/link";
import { notFound } from "next/navigation";

import { RecordFutureVisit } from "@/components/progress/RecordFutureVisit";
import { getAllFutures } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";

// Integration example only — unstyled. The frontend team owns the real design.

export function generateStaticParams() {
  return getAllFutures().map((f) => ({ slug: f.slug }));
}

export default async function FuturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = loadFutureView(slug);
  if (!view) notFound();

  return (
    <main style={{ padding: 32 }}>
      <RecordFutureVisit futureId={view.id} />

      <h1>
        {view.character.name} — {view.character.profession}
      </h1>
      {view.character.tagline && <p>“{view.character.tagline}”</p>}

      {view.story.canEnter ? (
        <ol>
          {view.story.scenes.map((scene) => (
            <li key={scene.id}>
              {scene.title} ({scene.character.name})
            </li>
          ))}
        </ol>
      ) : (
        <button type="button" disabled>
          Story coming soon
        </button>
      )}

      <h2>Portfolio{view.readiness.portfolioReady ? "" : " (coming soon)"}</h2>
      <ul>
        {view.portfolio.projects.map((p) => (
          <li key={p.id}>
            {p.title} {p.playable ? "· play" : "· in the works"}
          </li>
        ))}
      </ul>

      <Link href="/">Return to Eight Futures</Link>
    </main>
  );
}
