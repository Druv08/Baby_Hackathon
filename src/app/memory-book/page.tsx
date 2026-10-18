import type { Metadata } from "next";
import Link from "next/link";

import { ComingSoon, PageIntro } from "@/components/site/PageIntro";

export const metadata: Metadata = { title: "Memory Book" };

export default function MemoryBookPage() {
  return (
    <>
      <PageIntro icon="📖" eyebrow="Little dreams & memories" title="Memory Book">
        <p>A place where visitors leave a little dream for Maria, glowing like lanterns in the night.</p>
      </PageIntro>
      <section className="section" aria-label="Memory Book status">
        <div className="container">
          <ComingSoon icon="🏮" title="The lanterns are being lit">
            <p>The Memory Book opens soon. Until then, why not visit one of Maria&apos;s futures?</p>
            <Link href="/#futures" className="btn btn-primary">
              Explore My Futures <span aria-hidden="true">→</span>
            </Link>
          </ComingSoon>
        </div>
      </section>
    </>
  );
}
