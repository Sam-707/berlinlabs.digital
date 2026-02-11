# First Project Checklist

## Day 0 setup
- Copy `Studio-OS/` into the new repo root.
- Move `AI_RULES.md`, `CLAUDE.md`, `RUNBOOK.md`, and `README.md` to repo root.
- Keep `docs/`, `scripts/`, and `.github/` at repo root.
- If your tooling supports it, keep `.claude/` at repo root.

## First feature
- Run `./scripts/studio.sh`.
- Choose New feature to create branch + PRD.
- Fill `docs/prd/<slug>.md`.
- Ask Claude to read `CLAUDE.md` + the PRD.
- Verify using `RUNBOOK.md`.
- Open PR with "How tested" evidence.

## First bug
- Run `./scripts/studio.sh`.
- Choose New bug to create branch + bug card.
- Fill `docs/bugs/<slug>.md`.
- Ask Claude to fix with the smallest change.
- Verify using `RUNBOOK.md`.

## Ongoing rhythm
- One doc + one PR + one driver.
- If UI did not change, treat as not done.
- Add missing runbook steps as new flows appear.
