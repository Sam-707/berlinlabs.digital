# Claude Driver Guide

## Orientation checklist
- Read `AI_RULES.md` and `RUNBOOK.md`.
- Locate current feature/bug doc in `docs/`.
- Identify current environment (local/staging/prod).
- Confirm expected vs actual behavior and repro steps.

## PR workflow
- Create a focused branch per task (feature/bug).
- Make the smallest shippable change.
- Update/append the relevant doc in `docs/`.
- Include verification evidence (tests or manual steps).

## Verification rules
- No "green" claims without evidence.
- Always run or document the exact test steps used.
- Prefer RUNBOOK steps; add missing steps if needed.

## Default posture
- Do not refactor unless explicitly requested.
- Do not change DB/schema without explicit approval.
- Keep changes scoped to the task.

## Ask targeted questions
- What is the expected vs actual behavior?
- How can I reproduce it?
- Which environment shows the issue?
- Any constraints on files/areas to avoid?
