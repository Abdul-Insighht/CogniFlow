# CogniFlow Python AI Architecture

## Goal

CogniFlow helps a student decide what to work on next when they are overloaded by notes, tasks, deadlines, and stress. The output is not a generic chatbot answer. It is a state-aware action plan grounded in the student's own tasks and notes.

## Data Science Pipeline

```text
student check-in text
  -> NLP tokenization
  -> TF-IDF vectorization
  -> Naive Bayes cognitive-state classifier
  -> workload feature adjustment
  -> focused / neutral / stressed / overwhelmed state

student notes
  -> TF-IDF vectorization
  -> cosine similarity retrieval
  -> relevant second-brain memories

student tasks
  -> priority, effort, deadline features
  -> task score
  -> ranked tasks

state + retrieved notes + ranked tasks
  -> adaptive planner
  -> explained plan
  -> human accept/edit/reject
```

## Source Files

- `cogniflow/nlp.py`: tokenization, TF-IDF, cosine similarity, stress/focus signal extraction.
- `cogniflow/ml.py`: Multinomial Naive Bayes classifier, probability scores, explanation reasons, evaluation.
- `cogniflow/memory.py`: local second-brain retrieval using TF-IDF similarity.
- `cogniflow/planner.py`: adaptive decision-support logic.
- `cogniflow/pipeline.py`: complete data to AI to output pipeline.
- `main.py`: runnable demo.
- `train.py`: training/evaluation command.

## Why This Fits The Judging Criteria

### Problem Understanding

The decision context is clear: students need to decide what to do next under deadline pressure and cognitive overload. Constraints include privacy, low-end devices, limited coaching access, and the need to keep humans in control.

### AI/Analytics Reasoning

The project uses real data-science steps:

- NLP preprocessing.
- TF-IDF feature extraction.
- Machine learning classification.
- Retrieval through cosine similarity.
- Task ranking through engineered decision features.
- Explainable confidence and reasons.

### Solution Design

The system has a coherent data to AI to output pipeline. Each module has one responsibility, and the command-line demo shows the complete flow.

### Impact And Decision Value

The AI changes the student's action plan. Overwhelmed students receive fewer immediate actions; focused students receive deeper work suggestions.

### Responsible AI

The classifier is transparent, does not diagnose mental health, uses synthetic/user data only, and keeps final decisions with the student.

