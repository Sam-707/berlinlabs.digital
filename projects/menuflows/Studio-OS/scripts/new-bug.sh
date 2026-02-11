#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs"
TS="$(date +%Y%m%d-%H%M)"
SLUG="bug-$TS"
BRANCH="bug/$SLUG"
BUG_PATH="$DOCS_DIR/bugs/$SLUG.md"

if git -C "$ROOT_DIR" rev-parse --git-dir > /dev/null 2>&1; then
  git -C "$ROOT_DIR" checkout -b "$BRANCH"
fi

cp "$DOCS_DIR/bugs/template.md" "$BUG_PATH"

echo "Created bug card: $BUG_PATH"
if git -C "$ROOT_DIR" rev-parse --git-dir > /dev/null 2>&1; then
  echo "Branch: $BRANCH"
fi
