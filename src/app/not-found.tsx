import Link from "next/link";

import { ComingSoon, PageIntro } from "@/components/site/PageIntro";

export default function NotFound() {
  return (
    <>
      <PageIntro icon="🔍" eyebrow="Oops!" title="This path is a little lost" />
      <section className="section" aria-label="Page not found">
        <div className="container">
          <ComingSoon icon="🐾" title="Maria couldn't find that page">
            <p>Let&apos;s head back to the eight futures.</p>
            <Link href="/#futures" className="btn btn-primary">
              Back to Maria&apos;s Futures
            </Link>
          </ComingSoon>
        </div>
      </section>
    </>
  );
}
