#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs"
PRD_TEMPLATE="$DOCS_DIR/prd/template.md"
BUG_TEMPLATE="$DOCS_DIR/bugs/template.md"

prompt_choice() {
  printf "\nStudio Menu\n"
  printf "1) New feature (branch + PRD)\n"
  printf "2) New bug (branch + bug card)\n"
  printf "3) Open PRD/bug doc\n"
  printf "4) Show Claude driver prompt for chosen doc\n"
  printf "5) Run quick sanity test command (placeholder)\n"
  printf "6) Open PR\n"
  printf "Choose an option: "
}

new_feature() {
  printf "Feature slug (e.g. load-real-data): "
  read -r slug
  "$ROOT_DIR/scripts/new-feature.sh" "$slug"
}

new_bug() {
  "$ROOT_DIR/scripts/new-bug.sh"
}

open_doc() {
  printf "Open which doc? (p=PRD, b=bug): "
  read -r doc_type
  if [[ "$doc_type" == "p" ]]; then
    echo "Open: $PRD_TEMPLATE"
  elif [[ "$doc_type" == "b" ]]; then
    echo "Open: $BUG_TEMPLATE"
  else
    echo "Unknown choice."
  fi
}

show_claude_prompt() {
  printf "Prompt for (p=PRD, b=bug): "
  read -r doc_type
  if [[ "$doc_type" == "p" ]]; then
    echo "Use CLAUDE.md + docs/prd/template.md. Implement as driver and follow RUNBOOK.md."
  elif [[ "$doc_type" == "b" ]]; then
    echo "Use CLAUDE.md + docs/bugs/template.md. Implement as driver and follow RUNBOOK.md."
  else
    echo "Unknown choice."
  fi
}

run_sanity() {
  echo "Placeholder: run your quick sanity test command here."
  echo "Example: npm test -- --runInBand"
}

open_pr() {
  if [[ -x "$ROOT_DIR/scripts/open-pr.sh" ]]; then
    "$ROOT_DIR/scripts/open-pr.sh"
  else
    echo "Missing scripts/open-pr.sh"
    echo "If you use GitHub CLI: gh pr create --fill"
  fi
}

prompt_choice
read -r choice

case "$choice" in
  1) new_feature ;;
  2) new_bug ;;
  3) open_doc ;;
  4) show_claude_prompt ;;
  5) run_sanity ;;
  6) open_pr ;;
  *) echo "Unknown choice." ;;
esac
