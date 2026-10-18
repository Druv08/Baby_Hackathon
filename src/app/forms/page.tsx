import type { Metadata } from "next";

import { FutureGrid } from "@/components/futures/FutureGrid";
import { PageIntro } from "@/components/site/PageIntro";

export const metadata: Metadata = { title: "My Forms" };

export default function FormsPage() {
  return (
    <>
      <PageIntro icon="⭐" eyebrow="Eight dreams, one heart" title="My Forms">
        <p>Eight possible Marias, each with her own world. Pick any one — there&apos;s no wrong order.</p>
      </PageIntro>
      <section className="section" aria-label="All futures">
        <div className="container">
          <FutureGrid headingLevel="h2" />
        </div>
      </section>
    </>
  );
}
