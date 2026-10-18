import type { Metadata } from "next";

import { JourneyOverview, type JourneyFuture } from "@/components/progress/JourneyOverview";
import { PageIntro } from "@/components/site/PageIntro";
import { CHARACTER_THEMES } from "@/data/future-themes";
import { getAllFutures, getCharacterById } from "@/lib/content";

export const metadata: Metadata = { title: "My Journey" };

export default function JourneyPage() {
  const futures: JourneyFuture[] = getAllFutures().map((f) => ({
    id: f.id,
    slug: f.slug,
    label: CHARACTER_THEMES[f.slug].label,
    icon: CHARACTER_THEMES[f.slug].icon,
    profession: getCharacterById(f.characterId)?.profession ?? "",
  }));

  return (
    <>
      <PageIntro icon="🐾" eyebrow="Your adventure so far" title="My Journey">
        <p>Your progress is saved on this device only — no sign-up needed.</p>
      </PageIntro>
      <section className="section" aria-label="Journey progress">
        <div className="container">
          <JourneyOverview futures={futures} />
        </div>
      </section>
    </>
  );
}
