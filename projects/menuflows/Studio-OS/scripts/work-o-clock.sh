#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "🕒 WORK O'CLOCK — Menuflows Studio Flow"
echo "--------------------------------------"
echo ""

# 1) sanity checks
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Not inside a git repo."
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "Current branch: $BRANCH"
echo ""

if [[ -n "$(git status --porcelain)" ]]; then
  echo "⚠️ Working tree has changes."
  echo "Run: git status"
  echo "Tip: commit/stash before starting a new feature."
  echo ""
fi

echo "What are we doing?"
echo "  1) Start a new feature branch + PRD"
echo "  2) Open the PRD for editing"
echo "  3) Show the exact Claude prompt (Plan Mode)"
echo "  4) Push + open PR"
echo "  5) Show today’s workflow checklist"
echo ""

read -r -p "Choose (1-5): " CHOICE
echo ""

case "$CHOICE" in
  1)
    read -r -p "Feature slug (e.g. order-tracking): " SLUG
    ./scripts/new-feature.sh "$SLUG"
    echo ""
    echo "✅ Edit PRD at docs/prd/${SLUG}.md"
    echo "✅ Then tell Claude: Plan Mode for docs/prd/${SLUG}.md"
    ;;
  2)
    read -r -p "Feature slug to open PRD for: " SLUG
    FILE="docs/prd/${SLUG}.md"
    if [[ ! -f "$FILE" ]]; then
      echo "❌ PRD not found: $FILE"
      echo "Run: ./scripts/new-feature.sh ${SLUG}"
      exit 1
    fi
    if command -v code >/dev/null 2>&1; then
      code "$FILE"
      echo "✅ Opened: $FILE"
    else
      echo "Open this file: $FILE"
    fi
    ;;
  3)
    read -r -p "Feature slug: " SLUG
    FILE="docs/prd/${SLUG}.md"
    echo ""
    echo "Paste this into Claude Code:"
    echo "--------------------------------------"
    echo "Plan Mode for \`$FILE\`."
    echo "--------------------------------------"
    echo ""
    echo "After Claude asks questions + gives options, reply:"
    echo "GO with option X"
    ;;
  4)
    ./scripts/open-pr.sh
    ;;
  5)
    cat <<'EOF'
✅ Studio Checklist (every feature)

1) main clean:
   - git checkout main
   - git pull
   - git status (clean)

2) start feature:
   - ./scripts/new-feature.sh <slug>

3) write PRD:
   - docs/prd/<slug>.md (10–15 minutes max)

4) Claude Plan Mode:
   - "Plan Mode for docs/prd/<slug>.md"
   - answer questions
   - "GO with option X"

5) implement + PR:
   - ./scripts/open-pr.sh

6) truth:
   - CI green
   - Vercel preview tested (phone)
   - merge only if working
EOF
    ;;
  *)
    echo "❌ Invalid choice."
    exit 1
    ;;
esac

echo ""
