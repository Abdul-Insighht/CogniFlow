# CogniFlow Architecture

## Decision Context

The user is a student deciding what to do next under deadline pressure. The key decision is not "What information exists?" but "What should I work on now, given my mental state, deadlines, and personal study history?"

Constraints acknowledged:

- Students may use low-end devices.
- Internet may be unstable.
- Data is sensitive because notes and stress signals can reveal mental health and academic struggles.
- The system must not force decisions.
- The hackathon demo must be original work built during June 14-21, 2026.
- The demo should avoid unauthorized data and paid dependencies.

## Data To AI To Output Pipeline

```text
1. Student adds tasks and notes.
2. Student writes a natural-language check-in.
3. Cognitive State Detector reads:
   - stress/focus keywords
   - task count
   - deadline urgency
   - input length as overload signal
4. Memory Engine retrieves relevant notes using local term-vector similarity.
5. Adaptive Action Engine scores tasks by priority, urgency, and effort.
6. Planner creates a state-aware plan.
7. Student accepts, edits, or rejects the plan.
8. Accepted plan remains in local browser storage.
```

## Core Modules

### 1. Memory Engine

The demo stores notes in browser localStorage and retrieves them with cosine similarity over term-frequency vectors. This is a lightweight stand-in for a production RAG pipeline.

Production upgrade:

- Replace term vectors with local embeddings.
- Store vectors in IndexedDB or a local vector database.
- Add source citations for every retrieved note.

### 2. Cognitive State Detector

The detector classifies the student's current state as focused, neutral, stressed, or overwhelmed.

Signals:

- Natural language stress words.
- Natural language focus words.
- Number of active tasks.
- Number of tasks due within 24 hours.
- Long check-in length as a possible overload signal.

This is intentionally transparent for the hackathon. The demo shows confidence and signal chips so the student can challenge the result.

Production upgrade:

- Use a validated multilingual classifier.
- Calibrate thresholds with consent-based user studies.
- Add per-user personalization without sending raw text to a cloud server.

### 3. Adaptive Action Engine

The planner scores tasks by:

```text
task_score = priority * 10 + urgency * 4 - effort
```

Then it changes the plan style:

- Focused: deep-work block and hardest task first.
- Neutral: balanced urgent plan.
- Stressed: narrowed plan with recovery space.
- Overwhelmed: only two or three critical actions, hiding low-priority work.

### 4. Human In The Loop

CogniFlow never finalizes a plan automatically. The student can:

- Accept the plan.
- Edit the plan.
- Reject the plan.

This keeps academic and personal decisions under human control.

## Why This Is AI/Analytics, Not Buzzwords

CogniFlow uses AI-style analytics to transform messy personal input into a decision:

- NLP extracts stress/focus signals from text.
- Classification maps signals to a cognitive state.
- Retrieval finds relevant stored knowledge.
- Decision support ranks tasks and adapts the workload.

The value is the changed action plan, not merely generating text.

