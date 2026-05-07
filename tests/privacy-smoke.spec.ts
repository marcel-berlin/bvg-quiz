// tests/privacy-smoke.spec.ts
//
// Privacy smoke test (D-05, SETUP-04). Loads each Phase 1 route against the
// built `dist/` (served by `pnpm preview`), intercepts every network request via
// `page.route()` for ACTIVE interception (the abort capability is required —
// passive request listeners would let the request complete before the test sees it),
// and aborts any request whose origin is not allowlisted. Same-origin equivalents
// (localhost, 127.0.0.1, bvgquiz.vercel.app, *.vercel.app preview subdomains) are
// hard-coded in the spec; everything else must be in `privacy-allowlist.json`.
//
// privacy-allowlist.json schema (per D-06): array of objects shaped
//   { "origin": "https://example.com", "reason": "Why this origin is allowed", "added": "YYYY-MM-DD" }
// Phase 1 baseline: empty array. Every later addition leaves an audit-trail line in
// `git diff` with a justification + date.
//
// Doubles as the SETUP-06 route-200 check: each test asserts response.status() is 2xx.

import { test } from "@playwright/test";
import allowlist from "../privacy-allowlist.json" with { type: "json" };

const ROUTES = ["/", "/en/", "/canary"];
const SAME_ORIGIN_HOSTS = ["localhost", "127.0.0.1", "bvgquiz.vercel.app"];

type AllowEntry = { origin: string; reason: string; added: string };

function isAllowed(url: string): boolean {
  const u = new URL(url);
  if (SAME_ORIGIN_HOSTS.includes(u.hostname)) return true;
  // Allow Vercel preview subdomains (Pitfall 6): *.vercel.app
  if (u.hostname.endsWith(".vercel.app")) return true;
  return (allowlist as AllowEntry[]).some((entry) => entry.origin === u.origin);
}

for (const route of ROUTES) {
  test(`route ${route} makes no third-party requests`, async ({ page }) => {
    const externalRequests: { url: string; resourceType: string; initiator: string }[] = [];

    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (isAllowed(url)) {
        await route.continue();
      } else {
        externalRequests.push({
          url,
          resourceType: route.request().resourceType(),
          initiator: route.request().frame()?.url() ?? "<unknown>",
        });
        await route.abort();
      }
    });

    const response = await page.goto(route, { waitUntil: "networkidle" });
    // Also asserts SETUP-06: route returns 2xx
    if (!response || response.status() < 200 || response.status() >= 300) {
      throw new Error(`route ${route} returned status ${response?.status()}`);
    }

    if (externalRequests.length > 0) {
      throw new Error(JSON.stringify({
        kind: "third-party-request",
        route,
        violations: externalRequests,
      }));
    }
  });
}
