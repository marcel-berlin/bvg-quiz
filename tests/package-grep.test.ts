// tests/package-grep.test.ts
//
// Privacy-tracker package tripwire (SETUP-05). Reads package.json directly and
// asserts that no forbidden tracker / analytics / Vercel-runtime package has
// been added to dependencies or devDependencies. Combined with the runtime
// network gate in tests/privacy-smoke.spec.ts (which denies va.vercel-scripts.com,
// vitals.vercel-insights.com etc. at the wire level), this provides defense
// in depth: the package can't be added AND the runtime endpoint can't be reached.
//
// Maintenance: when a new tracker family ships, add its package name to
// FORBIDDEN. The list is alphabet-soup deliberate (ESM imports, scoped packages,
// pseudo-package strings like "next/font/google" that signify a Google-Fonts
// CDN call) — every entry costs one additional `it()` assertion.

import { describe, it, expect } from "vitest";
import pkg from "../package.json" with { type: "json" };

describe("package.json privacy gate (SETUP-05)", () => {
  const allDeps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  };
  const FORBIDDEN = [
    "@vercel/analytics",
    "@vercel/speed-insights",
    "@vercel/web-analytics",
    "@vercel/og",
    "@astrojs/vercel",
    "@astrojs/tailwind",
    "google-analytics",
    "gtag",
    "@google-analytics/data",
    "plausible-tracker",
    "fathom-client",
    "next/font/google",
  ];

  for (const name of FORBIDDEN) {
    it(`does not include forbidden package "${name}"`, () => {
      expect((allDeps as Record<string, string>)[name]).toBeUndefined();
    });
  }
});
