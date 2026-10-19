import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const rel = (p: string) => relative(ROOT, p).replaceAll("\\", "/");
const read = (p: string) => readFileSync(p, "utf8");
const isTest = (p: string) => /\.test\.ts$|test-backend\.ts$|[\\/]test[\\/]/.test(p);
const sourceFiles = walk(join(ROOT, "src")).filter((p) => /\.(ts|tsx)$/.test(p));
const appFiles = sourceFiles.filter((p) => !isTest(p));
const migrations = walk(join(ROOT, "supabase", "migrations")).map(read).join("\n");

describe("secrets stay server-side", () => {
  it("never exposes privileged keys through NEXT_PUBLIC_ variables", () => {
    const files = [...appFiles, join(ROOT, ".env.example"), join(ROOT, "next.config.ts")];
    for (const file of files) {
      expect({ file: rel(file), leak: /NEXT_PUBLIC_\w*(SERVICE|SECRET|ROLE|PRIVATE)/i.test(read(file)) }).toEqual({
        file: rel(file),
        leak: false,
      });
    }
  });

  it("marks every server module as server-only", () => {
    const serverModules = appFiles.filter((p) => rel(p).startsWith("src/lib/server/"));
    expect(serverModules.length).toBeGreaterThan(0);
    for (const file of serverModules) {
      expect({ file: rel(file), serverOnly: read(file).startsWith('import "server-only";') }).toEqual({
        file: rel(file),
        serverOnly: true,
      });
    }
  });

  it("reads the service role key only inside server modules", () => {
    for (const file of appFiles) {
      if (rel(file).startsWith("src/lib/server/")) continue;
      expect({ file: rel(file), usesKey: read(file).includes("SUPABASE_SERVICE_ROLE_KEY") }).toEqual({
        file: rel(file),
        usesKey: false,
      });
    }
  });

  it("never imports server modules from client components", () => {
    for (const file of appFiles.filter((p) => /^["']use client["']/.test(read(p)))) {
      expect({ file: rel(file), importsServer: /from ["']@\/lib\/server/.test(read(file)) }).toEqual({
        file: rel(file),
        importsServer: false,
      });
    }
  });

  it("ships an .env.example without real values and ignores real env files", () => {
    const example = read(join(ROOT, ".env.example"));
    for (const line of example.split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l))) {
      expect(line).toMatch(/^[A-Z_]+=$/);
    }
    const gitignore = read(join(ROOT, ".gitignore"));
    expect(gitignore).toMatch(/^\.env\*$/m);
    expect(gitignore).toMatch(/^!\.env\.example$/m);
  });
});

describe("moderation cannot be done publicly", () => {
  const routes = walk(join(ROOT, "src", "app", "api")).filter((p) => p.endsWith("route.ts"));

  it("public API routes expose only GET and POST", () => {
    expect(routes.length).toBe(2);
    for (const file of routes) {
      const exported = [...read(file).matchAll(/export const \{([^}]+)\}/g)].flatMap((m) =>
        m[1].split(",").map((s) => s.trim()),
      );
      expect(exported.sort()).toEqual(["GET", "POST"]);
      expect(read(file)).not.toMatch(/\b(PUT|PATCH|DELETE)\b/);
    }
  });

  it("only the server insert sets a status (auto-approve); nothing can edit, reject or delete memories", () => {
    const writers = appFiles.filter((file) => /status\s*:\s*["'](approved|rejected)["']/.test(read(file))).map(rel);
    expect(writers).toEqual(["src/lib/server/stores.ts"]);
    expect(read(join(ROOT, "src", "lib", "server", "stores.ts"))).not.toMatch(/status\s*:\s*["']rejected["']/);
    for (const file of appFiles) {
      expect(read(file)).not.toMatch(/\.from\(\s*["']memories["']\s*\)\s*\.(update|upsert|delete)\(/);
    }
  });
});

describe("database security", () => {
  it("enables RLS on every created table", () => {
    const tables = [...migrations.matchAll(/create table (public\.\w+)/g)].map((m) => m[1]);
    expect(tables).toEqual(expect.arrayContaining(["public.memories", "public.site_counters"]));
    for (const table of tables) {
      expect(migrations).toContain(`alter table ${table} enable row level security`);
    }
  });

  it("defines a read-only, approved-only public policy and no public write policies", () => {
    expect(migrations).toMatch(/for select\s+to anon, authenticated\s+using \(status = 'approved'\)/);
    expect(migrations).not.toMatch(/for (insert|update|delete|all)\b/i);
    expect(migrations).toMatch(/revoke insert, update, delete, truncate on public\.memories from anon, authenticated/);
    // Grants to the public roles are read-only.
    for (const grant of migrations.match(/grant [^;]+ to [^;]*\b(anon|authenticated)\b[^;]*;/gi) ?? []) {
      expect(grant).not.toMatch(/\b(insert|update|delete|truncate|all)\b/i);
    }
  });
});

describe("user content is never rendered as HTML", () => {
  it("does not use dangerouslySetInnerHTML anywhere", () => {
    for (const file of appFiles) expect(read(file)).not.toContain("dangerouslySetInnerHTML");
  });
});
