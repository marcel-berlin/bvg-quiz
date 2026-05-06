# BVG U-Bahn Personality Quiz

> Eine standalone, mobile-first Microsite, auf der Berliner:innen 12 Persönlichkeitsfragen beantworten und am Ende erfahren, welche der 9 Berliner U-Bahn-Linien (U1–U9) ihnen am ähnlichsten ist.
>
> Live: https://bvgquiz.vercel.app

**Status:** Phase 1 (Setup & Guardrails) abgeschlossen — leeres Astro-Scaffold mit allen Privacy-, A11y-, Performance- und i18n-Hard-Gates ab Commit #1. Quiz-Logik und Inhalte folgen in Phase 2–7.

## Was ist das

Ein internes Lern- + Demo-Projekt mit Pitch-Potenzial: wenn Voice und Polish stimmen, wird es dem BVG-CMO gepitcht. Zielgruppe ist die Persona "Lina" (28, Neukölln, NGO-Job, BVG-Social-Follower:in, ironisch). Der Hauptzweck der Microsite ist Shareability — die Pointe muss so sitzen, dass Lina ihr Ergebnis freiwillig in ihre Story packt, auch wenn es eine "uncoole" Linie ist (U6, U9).

Vollständiger Projekt-Kontext und Roadmap leben im privaten Companion-Repo (siehe **Internal docs** unten).

## Stack (kurz)

- **Astro 6** als Static-Site-Generator (zero JS by default — jedes KB muss verdient werden)
- **Tailwind v4** via `@tailwindcss/vite` für Styling
- **TypeScript strict** + **Zod** für Content-Schema-Validierung (Astro Content Collections)
- **Public Sans** + **Atkinson Hyperlegible** als selbst-gehostete Schriften (über Astro 6 Fonts API; **kein** Google Fonts CDN — DSGVO)
- **Hosting:** Vercel statisch (kein `@astrojs/vercel`-Adapter, kein Server-Runtime)
- **Tests:** Vitest (Schema + Bundle-Size + Package-Tripwire) + Playwright (Privacy-Smoke + zukünftige E2E)
- **i18n:** Astro built-in (`prefixDefaultLocale: false`); DE läuft prefix-frei, `/en/` ist als Stub für V2 architektonisch verbunden

Vollständige Stack-Begründung: [`CLAUDE.md`](CLAUDE.md) § Technology Stack.

## Lokal starten

Voraussetzungen: **Node 22+** (`nvm use 22`), **pnpm 10+** (`corepack enable`).

```bash
# Einmalig: Dependencies installieren + Playwright-Browser für Privacy-Smoke
pnpm install
pnpm dlx playwright install --with-deps chromium

# Dev-Server (Hot-Reload, läuft auf http://localhost:4321)
pnpm dev

# Production-Build (output in dist/)
pnpm build

# Lokale Preview von dist/ (gleiche URL wie dev, aber gebaute Version)
pnpm preview
```

## Tests lokal laufen lassen

```bash
# Schema-Test (Zod-Schema-Gate, ~1 s)
pnpm test:schema

# Privacy-Smoke (lädt /, /en/, blockt Drittanbieter-Requests)
pnpm build && pnpm test:privacy

# A11y-Lint (ESLint + jsx-a11y)
pnpm lint

# Astro+TypeScript-Check
pnpm check

# Alles auf einmal (Pre-PR-Sanity)
pnpm test:all
```

## Wie deployen

**Tu nichts.** Vercel deployed automatisch via GitHub-App:

- Pull-Request auf `main` → Vercel-Preview-URL kommentiert in PR + Lighthouse-CI läuft auf Preview
- Merge in `main` → Production-Deploy auf https://bvgquiz.vercel.app

**Direktes Pushen auf `main` ist blockiert** (Branch-Protection auf dem öffentlichen Repo). Jede Änderung muss über Feature-Branch + PR.

## Hard-Gates (was die CI blockt)

Vier benannte Status-Checks blocken den Merge in `main`. Wenn einer rot ist, geht der PR nicht durch — auch nicht für mich (Marcel = Repo-Admin, Bypass ist deaktiviert per `enforce_admins: false`).

| Check (Name in GitHub) | Was es prüft | Wo konfiguriert |
|------------------------|--------------|-----------------|
| `astro check` | TypeScript- + Astro-Syntax-Validität | `.github/workflows/ci.yml` |
| `eslint a11y` | A11y-Lint via `eslint-plugin-jsx-a11y` (WCAG 2.1 AA Linting-Baseline) | `eslint.config.js` |
| `build success` | `pnpm build` läuft durch + Vitest (Schema-Gate + Package-Tripwire + Bundle-Size) | `.github/workflows/ci.yml`, `tests/*.test.ts` |
| `privacy smoke test` | Playwright lädt jede Route, intercepted alle Network-Requests, fällt bei Drittanbieter-Origin | `tests/privacy-smoke.spec.ts`, `playwright.config.ts` |
| `lighthouse-ci` (informational) | Performance ≥ 0.9 + Accessibility = 1.0 auf Vercel-Preview (mobile preset) | `lighthouserc.json` |

## Privacy-Promise

**Keine User-Daten. Kein Tracking. Kein Cookie-Consent-Banner.**

Highlights:
- Selbst-gehostete Schriften statt Google Fonts CDN (Munich-Landgericht 2022)
- Kein `@vercel/analytics`, kein `@vercel/speed-insights`, kein Plausible
- Kein localStorage / sessionStorage / Cookie für Quiz-State
- Spotify nur als Link, nicht als Embed
- Privacy-Smoke-Test in CI als runtime-Tripwire

Vollständig dokumentiert im internen Privacy-Manifest unter `.planning/privacy.md` (im privaten Companion-Repo, siehe **Internal docs**). Das Manifest ist als Pitch-Asset für den BVG-CMO formuliert.

## Workflow für Änderungen

Bitte ALLE Änderungen über GSD-Commands laufen lassen — keine direkten Repo-Edits außerhalb GSD:

- `/gsd-quick` — Kleine Fixes, Doc-Updates, Ad-hoc-Tasks
- `/gsd-debug` — Investigations, Bugs
- `/gsd-execute-phase` — Geplante Phase-Arbeit (Phase 2 ff.)

Hintergrund: [`CLAUDE.md`](CLAUDE.md) § GSD Workflow Enforcement.

Pre-Commit-Hook (Prettier-Format-only) wurde für Phase 1 bewusst **deferred** — kann später via Quick-Task nachgerüstet werden, wenn der Workflow es verlangt.

## Internal docs (privates Companion-Repo)

Das Repo ist als **Two-Repo-Split** organisiert:

| Repo | Sichtbarkeit | Inhalt | Link |
|------|--------------|--------|------|
| `marcel-berlin/bvg-quiz` | **public** | App-Code, Vercel-Deploy-Quelle, Branch-Protection — was du gerade liest | https://github.com/marcel-berlin/bvg-quiz |
| `marcel-berlin/bvg-quiz-private` | **private** | Vollständige GSD-Audit-Spur: `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/privacy.md`, alle Phasen-Pläne und SUMMARYs | nur für Marcel sichtbar — bei Pitch-Bedarf via GitHub `@marcel-berlin` anfragen |

Im öffentlichen Repo gibt es kein `.planning/`-Verzeichnis. Wer den Pitch-Kontext braucht (Privacy-Manifest, Voice-Leitplanken, Decision-Log), bekommt ihn aus dem privaten Repo.

## Two-Repo-Sync (für Marcel)

Workflow nach jeder Phase / jedem PR auf dem privaten Repo:

```bash
# 1) Planning-Commits + App-Code in das private Repo pushen
git push private main

# 2) App-Code (ohne .planning/) in das öffentliche Repo synchronisieren
#    via filter-clone + force-push (Mirror-Pattern aus Plan 01-07)
./scripts/sync-public.sh
```

Das Sync-Skript `scripts/sync-public.sh` ist ein dünner Wrapper, der mit `git filter-repo --path .planning --invert-paths` einen sauberen Tree erzeugt und auf das öffentliche `main` pusht. Wenn das Skript noch nicht im Repo liegt, ist der Mini-Pattern aus dem Phase-1-Audit:

```bash
# Mirror-Clone in einem Temp-Ordner
git clone --mirror git@github.com:marcel-berlin/bvg-quiz-private.git /tmp/bvg-mirror
cd /tmp/bvg-mirror
git filter-repo --path .planning --invert-paths --force
git remote add public git@github.com:marcel-berlin/bvg-quiz.git
git push --force public main
```

Hintergrund (warum Two-Repo-Split): [`./scripts/sync-public.sh`](scripts/sync-public.sh) bzw. das Plan-01-07-Audit im privaten Repo erklärt die Mechanik. GitHub Free erlaubt keine Branch-Protection auf private Repos — der öffentliche Repo trägt die CI-Gates.

## Verzeichnisstruktur

```
.
├── .github/workflows/ci.yml    # 5-job CI (4 required + lighthouse-ci informational)
├── public/                     # Statische Assets (Favicon etc.)
├── src/
│   ├── content/lines/          # 9 minimale Linien-JSONs (u1..u9)
│   ├── content.config.ts       # Zod-Schema für Content-Collection
│   ├── layouts/BaseLayout.astro
│   ├── pages/index.astro       # DE Landing
│   ├── pages/en/index.astro    # EN Stub (V2)
│   └── styles/global.css       # Tailwind v4 + @theme
├── tests/
│   ├── schema.test.ts          # D-14 in-memory Zod-Demo
│   ├── package-grep.test.ts    # SETUP-05 Tripwire
│   ├── privacy-smoke.spec.ts   # Playwright Privacy-Smoke
│   ├── privacy-reporter.ts     # D-07 Plain-Text-Reporter
│   └── bundle-size.test.ts     # PERF-03 Placeholder
├── astro.config.mjs            # i18n + Fonts (top-level, stable)
├── eslint.config.js            # Flat config + jsx-a11y
├── lighthouserc.json           # Mobile perf ≥ 0.9, a11y = 1.0
├── playwright.config.ts        # webServer: pnpm preview
├── privacy-allowlist.json      # leer in Phase 1 (audit-trail per Eintrag)
├── vitest.config.ts
├── CLAUDE.md                   # Stack + Conventions
└── README.md                   # ← du bist hier
```

## Status / Roadmap-Stand

Phase 1 abgeschlossen: alle Hard-Gates verdrahtet, Vercel-Deploy live.

Nächste Phasen (Roadmap im privaten Repo unter `.planning/ROADMAP.md`):

- Phase 2: Voice / Differentiation Matrix / Visual Foundations
- Phase 3: Quiz Engine + Distribution Gate (10.000-Run Monte-Carlo)
- Phase 4: Quiz UI + Result-Page-Skeleton
- Phase 5: Content Authoring (~80 Antworten, 3-Pass-Review)
- Phase 6: Share-Mechanik + Real-Device-Test (4 Plattformen × iOS+Android)
- Phase 7: Pre-Launch Hard Gates (Lighthouse=100/90, externer Lina-Test, Network-Audit)

## Lizenzen / Credits

- Schriften: [Public Sans](https://public-sans.digital.gov/) (USWDS, SIL OFL), [Atkinson Hyperlegible](https://brailleinstitute.org/freefont) (Braille Institute, SIL OFL) — beide selbst-gehostet via [Fontsource](https://fontsource.org/)
- Build-Tools: Astro / Tailwind / Vitest / Playwright (jeweilige Open-Source-Lizenzen)

Keine offiziellen BVG-Brand-Assets verwendet. Visual-Recreation aus bvg.de für Pitch-Demo-Zwecke.
