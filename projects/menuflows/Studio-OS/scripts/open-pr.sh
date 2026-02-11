#!/usr/bin/env bash
set -euo pipefail

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" == "main" ]]; then
  echo "❌ You are on main. Switch to a feature branch first."
  exit 1
fi

git status
echo ""
echo "▶ Pushing branch: $BRANCH"
git push -u origin "$BRANCH"

echo ""
echo "✅ Branch pushed."
echo "Next: open GitHub and create a PR into main."
echo "Tip: paste your PR body template."
