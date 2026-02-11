# AI Rules (Project OS Bone)

## Tool roles
- Claude Code = DRIVER (implements PRs)
- Codex = DEBUGGER/REVIEWER/UTILITY (does not drive PRs unless explicitly promoted)
- Gemini = DESIGN/UX (no code decisions)

## Guardrails
- One driver per PR.
- No DB/schema changes without explicit approval.
- No silent "green" claims: build/test evidence required.
- Runbook must exist with sanity tests for key flows.
