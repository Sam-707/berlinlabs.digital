#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "❌ Feature slug required"
  echo "Usage: ./scripts/new-feature.sh <feature-slug>"
  echo "Example: ./scripts/new-feature.sh load-real-data"
  exit 1
fi

SLUG="$1"
BRANCH="feature/$SLUG"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs"
PRD_PATH="$DOCS_DIR/prd/$SLUG.md"

if [[ "$SLUG" =~ [A-Z] ]] || [[ "$SLUG" =~ [[:space:]] ]]; then
  echo "❌ Slug must be lowercase and contain no spaces."
  echo "Good: load-real-data"
  exit 1
fi

if git -C "$ROOT_DIR" rev-parse --git-dir > /dev/null 2>&1; then
  git -C "$ROOT_DIR" checkout -b "$BRANCH" >/dev/null 2>&1 || {
    echo "❌ Branch already exists: $BRANCH"
    echo "Tip: switch to it with: git checkout $BRANCH"
    exit 1
  }
fi

cp "$DOCS_DIR/prd/template.md" "$PRD_PATH"

echo "✅ Feature initialized"
echo "→ PRD: $PRD_PATH"
if git -C "$ROOT_DIR" rev-parse --git-dir > /dev/null 2>&1; then
  echo "→ Branch: $BRANCH"
fi
