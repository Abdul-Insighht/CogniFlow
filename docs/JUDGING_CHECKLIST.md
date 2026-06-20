# Judging Criteria Checklist

## Problem Understanding - 20%

- Clear decision context: deciding what to do next under deadline and stress.
- Constraints acknowledged: privacy, low-end devices, unstable internet, limited coaching access.
- User specified: university students with academic and personal workload pressure.

## AI/Analytics Reasoning - 30%

- NLP analyzes student check-ins.
- Pattern detection classifies stress/focus state.
- Retrieval finds relevant saved notes.
- Task scoring ranks urgency and priority.
- Reasoning is transparent through signal chips and confidence.

## Solution Design And Architecture - 25%

- Coherent pipeline: user input -> local memory -> state detection -> retrieval -> planner -> human approval.
- Working browser demo.
- Local-first storage.
- Modular implementation in `src/app.js` and `src/styles.css`.

## Impact And Decision Value - 15%

- Converts scattered tasks into a concrete next-action plan.
- Changes behavior based on mental state.
- Reduces prioritization burden for overwhelmed students.
- Avoids AI for AI's sake by targeting a real decision.

## Responsible AI And Ethics - 10%

- Addresses privacy, misclassification, hallucination, over-reliance, and bias.
- Uses local storage in the demo.
- Shows detected signals.
- Requires student accept/edit/reject.
- Discloses AI tool use and data sources.

## Submission Requirements

- Valid qualifier approval code: add from hackathon portal.
- Complete project description: `docs/SUBMISSION_ANSWERS.md`.
- Track and challenge selection: `docs/SUBMISSION_ANSWERS.md`.
- AI architecture explanation: `docs/ARCHITECTURE.md`.
- Human-in-loop design: app controls and docs.
- Responsible AI guardrail: `docs/RESPONSIBLE_AI.md`.
- Tools and data disclosure: README and submission answers.
- 3-5 minute pitch video: use `docs/PITCH_SCRIPT.md`.
- Working demo or walkthrough: open `index.html`.

