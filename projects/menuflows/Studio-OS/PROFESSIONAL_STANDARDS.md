# Professional Standards (Solo Builder + AI)

This is the minimum bar for professional work without overengineering.

Quick start: see `FIRST_PROJECT_CHECKLIST.md`.

## 1) Process
- PR-first for code changes.
- One driver per PR.
- Smallest shippable change.
- If no PR, say why.

## 2) Source of truth
- One doc per change (PRD or bug card).
- Runbook defines what "working" means.
- Anything not written is not a requirement.

## 3) Verification
- No "green" claims without evidence.
- Always record the exact commands or steps run.
- If you can’t verify, say so.

## 4) Quality bar
- Behavior is observable.
- Errors are surfaced, not swallowed.
- Key flows are checked (owner + customer when relevant).

## 5) Role boundaries
- Claude = driver.
- Codex = debugger/reviewer/scripts.
- Gemini = design/product.
- Do not mix drivers on one PR.

## 6) Release discipline
- Branch naming enforced.
- PR template includes "How tested".
- No direct main changes.

## 7) Communication
- Short, specific updates:
  - What changed
  - How verified
  - Risks remaining
- Never promise what you didn’t test.

## 8) Marketing lane
- Ideas live in docs, not commits.
- No forced git ceremony for non-code.
