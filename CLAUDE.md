<!-- GSD:project-start source:PROJECT.md -->
## Project

**BVG U-Bahn Personality Quiz**

Eine standalone, mobile-first Microsite, auf der Berliner:innen 12 Persönlichkeitsfragen beantworten und am Ende erfahren, welche der 9 Berliner U-Bahn-Linien (U1–U9) ihnen am ähnlichsten ist. Jedes Ergebnis kommt mit Persönlichkeitsbeschreibung, kompatibler Gegenlinie, Spotify-Vibe (als Link) und einer teilbaren 9:16-Story-Grafik. Zielgruppe: jüngere, Berlin-affine Persona "Lina" (28, Neukölln, NGO-Job, BVG-Social-Follower:in, ironisch).

**Core Value:** **Lina muss ihr Ergebnis teilen wollen** — auch wenn es eine "uncoole" Linie ist (U6, U9), muss die Pointe so gut sitzen, dass sie es mit einem Augenrollen UND einem Schmunzeln in ihre Story packt. Wenn Shareability stirbt, stirbt das Projekt.

### Constraints

- **Plattform**: Standalone Microsite auf bvgquiz.vercel.app — Hosting steht fest, Tech-Stack muss Vercel-native sein
- **Sprache**: Deutsch in V1, Englisch nur als Stretch — Plan-Architektur muss EN sauber abtrennbar machen
- **Datenschutz**: Keine User-Daten, kein Cookie-Consent — alle Tech-Entscheidungen müssen das wahren (kein GA, keine Tracker, keine externen Embeds mit Cookies)
- **Barrierefreiheit**: WCAG 2.1 AA Pflicht — gilt seit BFSG (Juni 2025); blockierender Quality-Gate
- **Performance**: <3 s auf 3G Mittelklasse-Mobile — Bilder optimiert, JS minimal, statisch wo möglich
- **Branding-Lizenz**: Keine BVG-Schriftlizenz — Open-Source-Fallback verpflichtend
- **Build-Modell**: AI-assisted mit non-technischer PMM-Person — Stack muss simpel, gut dokumentiert, wartbar sein
- **Voice-Risiko**: Stereotypen-Humor mit Leitplanken — jede Frage/Antwort braucht Voice-Review-Schritt
- **Pitch-Tauglichkeit**: Demo soll pitchbar sein bei BVG CMO — Qualität (Voice, Visual, Polish) ist KO-Kriterium
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

> _Last verified: 2026-05-05 (research session 01-RESEARCH.md). Zod is at v4 transitively; Astro Fonts API is stable, not experimental._

## TL;DR (One-Paragraph Recommendation)
## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Astro** | `^6.2.2` (latest stable, Mar 2026) | Static site generator, page routing, content collections, i18n, fonts, build pipeline | Ships **zero JS by default** — every kilobyte must be earned. Built-in i18n with `prefixDefaultLocale: false` lets DE-default + EN-stretch coexist cleanly. Built-in Fonts API (Astro 6) self-hosts fonts → no Google Fonts → no GDPR consent banner. Native `<Image />` optimization. Content Collections give type-safe quiz JSON. Astro outputs plain HTML and the Vercel adapter is **not required** for static export. (Verified via [Astro 6 release post](https://astro.build/blog/astro-6/), [Astro Vercel docs](https://docs.astro.build/en/guides/deploy/vercel/).) |
| **Tailwind CSS** | `^4.1` (via `@tailwindcss/vite`) | Utility-first styling | Tailwind v4 is **stable** (released Jan 2025) and uses a **CSS-first config** (no `tailwind.config.js`) — much friendlier for a non-engineer. Vite plugin (not the deprecated `@astrojs/tailwind` integration) is the **2026-correct** integration. Eliminates custom CSS hand-rolling, which is where non-engineers + AI most often produce broken/inconsistent code. |
| **TypeScript** | `^5.6` (bundled with Astro) | Type-checking for quiz data + scoring logic | Astro projects are TypeScript-by-default; turning it off is more work than leaving it on. **For Marcel: you write JS-flavored code; TypeScript runs in the background catching typos.** Critical for the scoring matrix (an off-by-one in a points map is a silent bug — TS catches it). |
| **Vanilla JavaScript** | ES2024 native, no framework | Quiz interactivity (question advance, answer click, result reveal, "nochmal machen") | Quiz interactivity is **trivial** (~150 lines): show one of 12 questions at a time, store 12 answers in `sessionStorage`, sum a points object, redirect to result page. **No need for React/Vue/Svelte** — they would each add 30-50 KB of runtime JS for zero added capability. Pure JS keeps page weight under 20 KB and is the **easiest possible code for Claude to maintain and Marcel to read**. |
| **Zod** | `^4.3.6 (transitive of Astro 6.2.2; do not pin manually)` | Runtime schema validation for quiz JSON | Already a transitive dependency of Astro Content Collections. Catches malformed quiz data at build time ("question 7 has no `lineWeights` for U6") instead of at user runtime. **NOTE:** Zod 4 (not 3) — error format is `result.error.issues[]`, not `result.error.errors[]`. Plans use Zod 4 syntax. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **`@astrojs/check`** | `^0.9` | TypeScript + Astro file checker | Always. Run before each commit. |
| **Public Sans** (font) | `2.x` (SIL OFL) | Primary UI typeface — BVG-Transit visual stand-in | Self-hosted via Astro 6 Fonts API. Strong, neutral, free, BVG-Transit-adjacent geometry. Maintained by USWDS for US gov sites — battle-tested for accessibility. ([Public Sans](https://public-sans.digital.gov/)) |
| **Atkinson Hyperlegible** (font) | Latest (SIL OFL) | Accent typeface for line numbers, share graphic captions, fine print | Designed by Braille Institute for low-vision users. **Used by Munich U-Bahn for platform signage since July 2025** — the closest possible "transit + accessible + free" choice. Use sparingly (numerals U1-U9, captions). ([Wikipedia](https://en.wikipedia.org/wiki/Atkinson_Hyperlegible)) |
| **`nanostores`** + **`@nanostores/persistent`** | `^0.11` / `^0.10` | Optional: cross-page quiz state via `sessionStorage` | **Only if** the quiz spans multiple Astro pages instead of one. Default recommendation: single-page quiz, no nanostores needed. If we go multi-page, this is 800 bytes vs. hand-rolled bug-prone wrappers. |
| **`astro-icon`** | `^1.1` | Inline SVG icons (arrow, share, refresh, U-Bahn line marks) | Lets us keep all 9 line-color circles + UI icons as inline SVG (zero extra HTTP requests, perfect crispness on Retina, scriptable colors). |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| **`pnpm`** | Package manager | Use `pnpm` over `npm` — faster installs, stricter dependency hygiene. Vercel auto-detects it. |
| **Prettier** + **`prettier-plugin-astro`** | Code formatting | Configured to run on save. Removes "should I indent here?" questions from the workflow. |
| **`eslint-plugin-astro`** + **`eslint-plugin-jsx-a11y`** | Static accessibility checks | Catches missing `alt`, missing `aria-*`, label-without-input, etc. **WCAG 2.1 AA gate is mandatory** — this is the cheapest first line of defense. ([eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)) |
| **Lighthouse CI** (Vercel-native) | Performance + a11y + best-practice scoring on every preview deploy | Vercel runs Lighthouse on PR previews automatically. Performance budget: **Performance ≥ 90, Accessibility = 100** on mobile. Block merge if accessibility < 100. |
| **axe DevTools** (browser extension) | Manual a11y audit before every release | Free Chrome extension. Marcel runs it on each result page once before launch. Catches ~57% of WCAG violations automatically; the rest is keyboard-nav + screen-reader spot checks. ([axe-core](https://github.com/dequelabs/axe-core)) |
| **Playwright** | Optional: 1-2 smoke tests (does the quiz produce a result? does the share link load?) | Don't over-test. Two scripted user journeys is the right amount for a 100% UI project of this size. |
| **VS Code** + Astro extension + Tailwind extension | Editor | Astro extension is non-negotiable — gives syntax + autocomplete in `.astro` files. |
## Installation
# Initial scaffold (run once)
# Tailwind v4 via Vite plugin (NOT the deprecated @astrojs/tailwind)
# Icons + a11y linting
# (Optional) cross-page state
# pnpm add nanostores @nanostores/persistent
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Astro 6** | **Next.js 15** (App Router) | Use Next.js if you need SSR, server actions, ISR, or a heavy React ecosystem (e.g., complex auth flows, real-time data). For a static quiz with no backend, Next.js ships ~10× more JavaScript per page (~180 KB vs ~18 KB) and adds React + framework runtime cost we never use. ([Performance comparison](https://eastondev.com/blog/en/posts/dev/20251202-astro-vs-nextjs-comparison/)) |
| **Astro 6** | **SvelteKit** | Use SvelteKit if the quiz had heavy real-time interactivity (e.g., multiplayer, live stats). Single-quiz personality test does not warrant a reactive framework. |
| **Astro 6** | **Plain HTML + vanilla JS, no framework** | Tempting for "ultimate simplicity," but loses: typed content, i18n routing, image optimization, Fonts API, dev server with HMR, content validation. Astro's overhead = essentially zero (you literally ship plain HTML), so there's no cost to having the tooling. |
| **Vanilla JS** | **React island** for quiz | Use React island only if a designer hands us a complex animated interaction that's painful in vanilla JS. Even then, prefer **Preact** (3 KB) over React (45 KB). Default: ship vanilla JS. |
| **Tailwind v4 Vite plugin** | **`@astrojs/tailwind` integration** | **Don't.** That integration is **deprecated for Tailwind v4** — Astro and Tailwind teams now both recommend the Vite plugin. ([Source](https://astro.build/blog/astro-520/)) |
| **Public Sans + Atkinson Hyperlegible** | **Inter** | Inter is great but not transit-flavored. **Hyperlegible Sans** (a fork of Inter with hyperlegible tweaks) is also reasonable as a single-font choice if we want to simplify. |
| **JSON in Content Collections** | **Markdown frontmatter** | Use Markdown if quiz copy needed rich text (bold, links). Quiz questions are short single-line strings → JSON is simpler and prevents copy authors from accidentally injecting HTML. |
| **Static result pages (`/ergebnis/u1/`)** | **Single page + query string (`/ergebnis?line=u1`)** | Don't. Static pages give: perfect Open Graph previews per result, browser-cached, zero JS to render result, deep-linkable, indexable. Query-string approach loses all of that. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Google Fonts (CDN-loaded)** | Sends user IPs to Google → multiple EU court rulings (Munich, Wiesbaden) classify this as a GDPR violation → would force a cookie/consent banner, which the project explicitly forbids. ([Usercentrics summary](https://usercentrics.com/knowledge-hub/google-fonts-gdpr-compliant/)) | **Self-host fonts** via Astro 6 Fonts API (Fontsource provider). Zero IP leakage, faster load, fully WOFF2-optimized. |
| **`@astrojs/tailwind` integration** | Deprecated for Tailwind v4. Will silently miss new v4 features. | `@tailwindcss/vite` plugin (the canonical 2026 integration). |
| **Spotify embed iframes** | Each iframe drops third-party cookies → triggers consent-banner requirement → kills the "no consent banner" constraint. | Plain `<a href="https://open.spotify.com/playlist/…" target="_blank" rel="noopener">` links. (Already a project decision; documented here for stack-level enforcement.) |
| **Vercel Analytics, Plausible-on-Vercel, any analytics** | Project requirement: zero tracking, zero data persistence. KPIs measured manually via social listening in V1. | Nothing in V1. If V2 needs metrics, **Plausible self-hosted** or **Vercel Web Analytics with cookie-less mode** are the closest GDPR-friendly options — but both require a privacy review before adding. |
| **Cookie consent banners (Cookiebot, Usercentrics, Klaro)** | Not needed if you don't set cookies or load third-party scripts. Adding one defeats the whole architecture. | Nothing. The architecture's whole point is that no banner is required. |
| **Headless CMS (Contentful, Sanity, Storyblok)** | Adds a runtime API call, an account, a paid tier eventually, a second system for Marcel to learn, and a lock-in vector. Quiz copy is ~80 strings — totally fine in `src/content/`. | **Astro Content Collections** with JSON files in the repo. Edit with VS Code. Git is the audit trail. |
| **Database (Postgres, Vercel KV, Supabase)** | No user data is stored. There's nothing to put in a database. | `sessionStorage` for quiz progress; static URLs for shared results. |
| **`@vercel/og` / Satori for dynamic OG images** | Project decision: **9 fixed pre-designed share graphics** (not personalized). Dynamic OG generation would add a runtime function (Vercel Edge), build complexity, and design inconsistency. | Pre-designed PNG files in `public/share/u1.png` … `public/share/u9.png`. Astro static site, zero functions. |
| **Heavy animation libs (Framer Motion, GSAP)** | 30-100 KB of JS for animations the quiz doesn't need. Also poor for `prefers-reduced-motion` users without extra work. | CSS transitions + Tailwind's `transition-*` utilities. Optionally Astro's built-in **View Transitions API** (zero JS, browser-native, free). |
| **Internationalization libs (`i18next`, `react-intl`, `vue-i18n`)** | Astro 6 has built-in i18n. Adding a library duplicates work and locks us into a framework choice. | Astro's built-in `astro:i18n` module + content folders. |
| **`@astrojs/vercel` adapter (for static-only sites)** | Only needed if using Vercel-specific runtime features (Image Optimization, Web Analytics, ISR, edge functions). We use none of these. Adding it triggers function deployments that should be static files. | No adapter. Vercel auto-detects Astro and serves the `dist/` folder as static HTML. ([Astro Vercel guide](https://docs.astro.build/en/guides/deploy/vercel/)) |
| **`localStorage` for quiz answers** | Persists across sessions → reads as "tracking" to a privacy-cautious user → semantically wrong (we don't want to remember last week's answers). | `sessionStorage` (cleared on tab close). Or pure in-memory state if the quiz is single-page. |
## Stack Patterns by Variant
### **If the quiz fits on ONE Astro page** (recommended default):
- One file: `src/pages/quiz.astro`
- All 12 questions rendered as 12 hidden `<section>` elements
- Vanilla JS toggles `hidden` attribute + tracks answers in a JS object
- On submit: JS computes winner, redirects to `/ergebnis/u${n}/`
- **No nanostores, no client routing, no SPA, no hydration**
- Simplest possible architecture; ~150 lines of JS total
### **If the quiz spans MULTIPLE pages** (one question per page, snappier feel, better deep-link recovery):
- Pages: `src/pages/frage/[1..12].astro`
- State lives in `sessionStorage` via `@nanostores/persistent`
- Astro **View Transitions** (`<ClientRouter />`) gives native cross-page animation with zero JS overhead
- More files, slightly more JS (~3 KB nanostores), but better UX on slow 3G (each step is its own cached page)
### **If/when EN stretch ships:**
- `src/pages/en/index.astro`, `src/pages/en/quiz.astro`, `src/pages/en/ergebnis/u1.astro`, …
- Or: move all pages into `src/pages/[lang]/` and let `getStaticPaths` generate both
- Quiz JSON gets a sibling: `src/content/quiz/de.json` + `src/content/quiz/en.json`
- A language switcher is **two `<a>` tags**, no library needed
- All current code keeps working — `prefixDefaultLocale: false` was set on day one
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `astro@^6.2.2` | `node@>=22.0.0` | Astro 6 dropped Node 18 support. Vercel default runtime is Node 22 → fine. Local dev: `nvm use 22`. |
| `astro@^6.2.2` | `tailwindcss@^4.1` | **Requires Astro ≥ 5.2** for Tailwind v4 Vite-plugin support. Astro 6 includes this. |
| `tailwindcss@^4.1` | `@tailwindcss/vite@^4.1` | **Must match major version.** |
| `astro@^6.2.2` | `@astrojs/check@^0.9` | TypeScript checker for `.astro` files. |
| `astro@^6.2.2` | NO `@astrojs/vercel` adapter | Static export to `dist/`; Vercel serves it directly. |
## Ops Notes for a Non-Engineer
## Sources
### High-Confidence (Official Docs / Release Notes)
- [Astro 6.0 release notes](https://astro.build/blog/astro-6/) — confirmed Astro 6 is stable Mar 2026; built-in Fonts API, CSP API
- [Astro 6.2.2 GitHub release](https://github.com/withastro/astro/releases) — confirmed 6.2.2 is current latest as of May 2026
- [Astro Vercel deployment guide](https://docs.astro.build/en/guides/deploy/vercel/) — confirmed adapter not required for static sites
- [Astro i18n routing docs](https://docs.astro.build/en/guides/internationalization/) — confirmed `prefixDefaultLocale: false` config pattern
- [Astro Content Collections docs](https://docs.astro.build/en/guides/content-collections/) — confirmed JSON loader + Zod validation
- [Astro Image guide](https://docs.astro.build/en/guides/images/) — confirmed `public/` for downloadable original-quality assets
- [Astro Fonts API (stable in 6.x — top-level `fonts:` config, NOT `experimental.fonts:`)](https://docs.astro.build/en/guides/fonts/) — confirmed Fontsource self-hosting pattern
- [Tailwind CSS v4 stable](https://tailwindcss.com/blog) — confirmed v4 stable since Jan 2025, current minor v4.1+
- [Astro 5.2 + Tailwind v4 announcement](https://astro.build/blog/astro-520/) — confirmed Vite plugin is the canonical integration; `@astrojs/tailwind` deprecated for v4
- [Public Sans (USWDS)](https://public-sans.digital.gov/) — confirmed SIL OFL licensed, accessibility-tested
- [Atkinson Hyperlegible (Wikipedia)](https://en.wikipedia.org/wiki/Atkinson_Hyperlegible) — confirmed used by Munich U-Bahn signage since July 2025
### Medium-Confidence (Multiple Independent Sources Agree)
- [Astro vs Next.js 2026 performance benchmarks](https://eastondev.com/blog/en/posts/dev/20251202-astro-vs-nextjs-comparison/) — Astro ~18 KB JS vs Next.js ~180 KB JS (single source; directionally consistent with Astro's own marketing claims and other comparison articles)
- [Google Fonts GDPR ruling summary (Usercentrics)](https://usercentrics.com/knowledge-hub/google-fonts-gdpr-compliant/) — Munich court 2022 ruling; corroborated by multiple legal/privacy sources
- [Hyperlegible Sans (fork of Inter)](https://github.com/matthewlarn/hyperlegible-sans) — alternative if a single sans is preferred over the Public Sans + Atkinson combo
### Low-Confidence (Single Source / Worth Re-Verifying)
- Specific Astro adapter version `@astrojs/vercel@10.0.6` — not in our recommended stack so version drift doesn't affect us, but flag if we later need Vercel-specific features
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
