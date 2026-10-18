import { getAllFutures, getFutureCharacter, getFutureReadiness } from "@/lib/content";
import { SITE_CONFIG } from "@/data/site-config";

// Temporary placeholder: lists content readiness until the real frontend lands.
export default function Home() {
  return (
    <main style={{ padding: 32 }}>
      <h1>{SITE_CONFIG.title}</h1>
      <ul>
        {getAllFutures().map((f) => {
          const character = getFutureCharacter(f.slug);
          const readiness = getFutureReadiness(f.slug);
          return (
            <li key={f.slug}>
              {character?.name} — {character?.profession} · hero:{" "}
              {readiness?.heroAvailable ? "yes" : "no"} · story: {f.storyStatus} · portfolio:{" "}
              {f.portfolioStatus}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
