import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

describe("PERF-03 placeholder: zero-JS-by-default budget on /", () => {
  it("dist/_astro/*.js total gzipped size ≤ 20 KB (20 * 1024 bytes)", () => {
    const astroDir = join(process.cwd(), "dist", "_astro");
    if (!existsSync(astroDir)) {
      throw new Error("dist/_astro/ not found — run `pnpm build` before this test.");
    }
    const jsFiles = readdirSync(astroDir).filter((f) => f.endsWith(".js"));

    let totalGzipped = 0;
    for (const file of jsFiles) {
      const buf = readFileSync(join(astroDir, file));
      totalGzipped += gzipSync(buf).length;
    }

    const limit = 20 * 1024; // 20 KB gzipped
    expect(totalGzipped).toBeLessThanOrEqual(limit);
  });
});
