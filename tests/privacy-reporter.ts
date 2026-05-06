// tests/privacy-reporter.ts
//
// Custom Playwright reporter (D-07). When a privacy-smoke test fails because of
// non-allowlisted requests, this reporter parses the JSON-encoded error message
// produced by tests/privacy-smoke.spec.ts and prints a Marcel-readable plain-text
// block describing the violation and the two possible fixes (remove the request
// OR add the origin with a justification to privacy-allowlist.json).
//
// Limitation: Playwright's Request API does not expose the source HTML line. We
// print Resource type + Frame as the closest available context, plus a `grep -rn`
// hint for finding the source file in dist/.

import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";

export default class PrivacyReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== "failed") return;
    for (const error of result.errors ?? []) {
      try {
        // Playwright prefixes thrown-Error messages with "Error: "; strip it before parsing.
        let raw = error.message ?? "";
        if (raw.startsWith("Error: ")) raw = raw.slice("Error: ".length);
        // Strip ANSI color escapes that Playwright may add to error messages.
        raw = raw.replace(/\[[0-9;]*m/g, "");
        const payload = JSON.parse(raw);
        if (payload.kind === "third-party-request") {
          console.log("\n========================================");
          console.log("FAIL: Drittanbieter-Request entdeckt");
          console.log(`  Route:         ${payload.route}`);
          for (const v of payload.violations) {
            console.log(`  URL:           ${v.url}`);
            console.log(`  Resource type: ${v.resourceType}`);
            console.log(`  Frame:         ${v.initiator}`);
          }
          console.log("  Erlaubt:       same-origin (bvgquiz.vercel.app, *.vercel.app, localhost) + Einträge aus privacy-allowlist.json");
          console.log("  Fix:           (a) Entferne den externen Request, ODER");
          console.log("                 (b) füge die Origin mit Begründung in privacy-allowlist.json hinzu");
          console.log("                     Schema: { origin, reason, added: YYYY-MM-DD }");
          console.log("  Hinweis:       Playwright kann die exakte Quell-Zeile im HTML nicht ausliefern.");
          console.log("                 Tipp: grep -rn \"<URL-host>\" dist/ um die Quelldatei zu finden.");
          console.log("========================================\n");
          continue;
        }
      } catch { /* fall back to default */ }
      console.error(error.message);
    }
  }
}
