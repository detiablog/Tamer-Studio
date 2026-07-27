import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { statSync } from "node:fs";

const ADMIN_DIR = join(process.cwd(), "src", "app", "admin", "(protected)");

const PROTECTED_PATTERNS = [
  "/api/admin/",
  "/api/landing/sections",
];

function walk(dir: string): string[] {
  let results: string[] = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      results = results.concat(walk(full));
      continue;
    }
    if (entry.endsWith("page.tsx") || entry.endsWith(".tsx")) {
      results.push(full);
    }
  }
  return results;
}

function extractFetchCalls(content: string) {
  const lines = content.split("\n");
  const fetches: { line: number; call: string; hasAuth: boolean; url: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("await fetch(") && !line.includes("fetch(")) continue;

    const hasAuth =
      line.includes("Authorization") ||
      line.includes("authHeaders") ||
      line.includes("credentials:");

    const urlMatch = line.match(/fetch\(["']([^"']+)["']/);
    const url = urlMatch ? urlMatch[1] : "dynamic";

    fetches.push({
      line: i + 1,
      call: line.trim(),
      hasAuth,
      url,
    });
  }

  return fetches;
}

const files = walk(ADMIN_DIR);

for (const file of files) {
  const content = readFileSync(file, "utf-8");

  const isClient = content.includes('"use client"') || content.includes("'use client'");
  if (!isClient) continue;

  const fetches = extractFetchCalls(content);
  if (fetches.length === 0) continue;

  const hasProtected = fetches.some((f) =>
    PROTECTED_PATTERNS.some((p) => f.url.includes(p) || f.call.includes(p))
  );
  if (!hasProtected) continue;

  const rel = relative(join(process.cwd(), "src"), file);
  console.log(`\n${"=".repeat(80)}`);
  console.log(`FILE: src/${rel}`);
  console.log("=".repeat(80));

  for (const f of fetches) {
    const isProtected = PROTECTED_PATTERNS.some((p) => f.url.includes(p) || f.call.includes(p));
    const status = f.hasAuth ? "✅ HAS AUTH" : isProtected ? "❌ MISSING AUTH" : "⚠️  CHECK";
    console.log(`  Line ${f.line}: ${status}`);
    console.log(`    URL: ${f.url}`);
    console.log(`    Code: ${f.call.slice(0, 120)}`);
  }
}
