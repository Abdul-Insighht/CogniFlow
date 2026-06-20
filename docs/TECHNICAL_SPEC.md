# Technical Spec

## Product Name

CogniFlow

## User

University students managing multiple classes, assignments, deadlines, and personal responsibilities.

## Core Decision

What should the student work on next, given their current mental state and workload?

## Inputs

- Student check-in text.
- Tasks with title, course, deadline, priority, and effort.
- Notes stored in the second brain memory.

## Outputs

- Cognitive state: focused, neutral, stressed, or overwhelmed.
- Confidence score.
- Transparent signal chips.
- Retrieved relevant notes.
- Adaptive action plan.
- Accepted, edited, or rejected plan state.

## Cognitive State Logic

The demo estimates state using:

- Stress keywords.
- Focus keywords.
- Number of tasks.
- Number of tasks due within 24 hours.
- Check-in length.

This approach is explainable and appropriate for a demo. It should be replaced with a validated classifier before real deployment.

## Retrieval Logic

The demo uses:

- Tokenization.
- Term-frequency vectors.
- Cosine similarity.

This simulates a small local RAG system without external APIs.

## Planning Logic

Tasks are ranked with:

```text
score = priority * 10 + urgency * 4 - effort
```

Plan style changes by state:

- Focused: harder work and deep-work blocks.
- Neutral: balanced urgent work.
- Stressed: narrowed workload and short breaks.
- Overwhelmed: only critical next actions.

## Storage

Browser localStorage under:

```text
cogniflow-demo-v1
```

## Privacy Model

The demo has no backend and no network calls. Data remains in the user's current browser storage.

## Known Limitations

- Rule-based state detection can be wrong.
- English keyword list is limited.
- localStorage is not encrypted.
- The demo is not a medical or therapy tool.
- Browser-only data does not sync across devices.

## Future Improvements

- IndexedDB storage.
- Local embeddings.
- Multilingual support for Urdu, Hindi, Bengali, Hausa, and English.
- Calendar import with explicit consent.
- Crisis-safe escalation wording.
- User correction loop for state labels.

