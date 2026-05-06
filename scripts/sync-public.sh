#!/usr/bin/env bash
# scripts/sync-public.sh
#
# Two-repo sync helper for the BVG U-Bahn Personality Quiz.
#
# Hintergrund:
# Das Repo ist als Two-Repo-Split organisiert (siehe README.md § Internal docs):
#   - marcel-berlin/bvg-quiz-private (private)  — full GSD audit trail mit .planning/
#   - marcel-berlin/bvg-quiz         (public)   — Vercel-Deploy-Quelle, ohne .planning/
#
# Dieses Skript spiegelt das private Repo in den öffentlichen Repo, indem es
# `git filter-repo --path .planning --invert-paths` über einen Mirror-Clone laufen
# lässt und das Ergebnis force-pushed. Branch-Protection auf dem öffentlichen Repo
# erzwingt die CI-Gates auf dem main; force-push auf main wird vom GitHub-Hook
# abgelehnt — daher pushed das Skript auf einen Sync-Branch und öffnet einen PR.
#
# Voraussetzungen:
#   - git (>= 2.30)
#   - git-filter-repo  (brew install git-filter-repo  /  pip install git-filter-repo)
#   - gh CLI (für PR-Erstellung; optional, sonst PR manuell)
#
# Usage:
#   ./scripts/sync-public.sh                # erzeugt sync-branch + PR
#   ./scripts/sync-public.sh --dry-run      # erzeugt nur den filtered tree, kein push
#
# Das Skript ist intentional kurz und linear: die Sync-Mechanik ist bereits
# im Phase-1-Audit (Plan 01-07-SUMMARY.md im privaten Repo) dokumentiert; dieses
# Skript ist die ausführbare Form derselben Schritte.

set -euo pipefail

PRIVATE_REMOTE="${PRIVATE_REMOTE:-git@github.com:marcel-berlin/bvg-quiz-private.git}"
PUBLIC_REMOTE="${PUBLIC_REMOTE:-git@github.com:marcel-berlin/bvg-quiz.git}"
SYNC_BRANCH="${SYNC_BRANCH:-sync/from-private-$(date +%Y%m%d-%H%M%S)}"
TMP_DIR="${TMP_DIR:-$(mktemp -d -t bvg-sync-XXXXXX)}"
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '1,40p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "FATAL: git-filter-repo not installed."
  echo "Install via:  brew install git-filter-repo  OR  pip install git-filter-repo"
  exit 1
fi

echo "==> Mirror-Clone: $PRIVATE_REMOTE -> $TMP_DIR"
git clone --mirror "$PRIVATE_REMOTE" "$TMP_DIR/mirror.git"

cd "$TMP_DIR/mirror.git"

echo "==> Filtering .planning/ aus der Historie"
git filter-repo --path .planning --invert-paths --force

if [ "$DRY_RUN" -eq 1 ]; then
  echo "==> Dry-run: filtered mirror liegt in $TMP_DIR/mirror.git"
  echo "    Inspect with: cd $TMP_DIR/mirror.git && git log --oneline | head"
  exit 0
fi

echo "==> Push gefilterten Tree als $SYNC_BRANCH auf $PUBLIC_REMOTE"
git remote add public "$PUBLIC_REMOTE"
# Push the rewritten main as a sync branch (NEVER force-push public main directly —
# branch protection blocks it and that is by design).
git push public "main:refs/heads/$SYNC_BRANCH"

if command -v gh >/dev/null 2>&1; then
  echo "==> PR auf marcel-berlin/bvg-quiz öffnen"
  gh pr create \
    --repo marcel-berlin/bvg-quiz \
    --base main \
    --head "$SYNC_BRANCH" \
    --title "sync: import from private repo" \
    --body "Automated sync from marcel-berlin/bvg-quiz-private. CI gates apply." || true
else
  echo "==> gh CLI nicht installiert — PR bitte manuell öffnen:"
  echo "    https://github.com/marcel-berlin/bvg-quiz/compare/main...$SYNC_BRANCH"
fi

echo "==> Done. Cleanup: rm -rf $TMP_DIR"
