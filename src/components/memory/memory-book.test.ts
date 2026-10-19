import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("Memory Book wiring", () => {
  it("Luna's Moonlit Memory Book shares the page's feed and submit hooks (one backend)", () => {
    const luna = source("src/components/luna/MoonlitMemoryBook.tsx");
    const page = source("src/components/memory/MemoryBook.tsx");
    expect(luna).toContain('from "@/components/memory/useMemoryBook"');
    expect(page).toContain('from "./useMemoryBook"');
    for (const file of [luna, page]) {
      expect(file).toMatch(/useMemoryFeed\(/);
      expect(file).toMatch(/useMemorySubmit\(/);
    }
    // Neither talks to the database directly.
    expect(luna + page).not.toMatch(/supabase/i);
  });

  it("renders visitor text as plain text only", () => {
    for (const path of ["src/components/memory/MemoryBook.tsx", "src/components/luna/MoonlitMemoryBook.tsx", "src/app/memory-book/page.tsx"]) {
      expect(source(path)).not.toContain("dangerouslySetInnerHTML");
    }
  });

  it("only shows memories returned by the API; a successful send never adds to the lake", () => {
    const hooks = source("src/components/memory/useMemoryBook.ts");
    const submit = hooks.slice(hooks.indexOf("export function useMemorySubmit"));
    expect(submit).not.toMatch(/setMemories/);
    expect(hooks).toMatch(/fetchMemories\(\{ limit: pageSize, before \}\)/);
  });
});

describe("navbar", () => {
  const css = source("src/components/site/SiteHeader.module.css");
  it("keeps the five desktop links on one row and never breaks a label", () => {
    expect(css).toMatch(/\.list \{[^}]*flex-wrap: nowrap/);
    expect(css).toMatch(/\.link \{[^}]*white-space: nowrap/);
  });
  it("shows the full row down to 761px and only folds into the menu on narrow screens", () => {
    expect(css).toMatch(/@media \(max-width: 760px\) \{\s*\.toggle \{\s*display: inline-flex/);
    expect(css).not.toMatch(/@media \(max-width: 960px\)/);
  });
});
