# CogniFlow Python AI Project

CogniFlow is a Python-based AI/data-science prototype for an emotionally aware second brain for university students. It uses NLP, machine learning style classification, retrieval, and decision-support planning to help students prioritize work under cognitive overload.

This is the primary implementation. The project is not dependent on web development.

## Core AI Techniques

- NLP preprocessing: tokenization, term counts, stress/focus signal extraction.
- Feature engineering: TF-IDF vectors, deadline urgency, active task count, effort and priority scores.
- Machine learning: transparent Multinomial Naive Bayes classifier for cognitive state prediction.
- Retrieval/RAG-style memory: TF-IDF cosine similarity over saved notes.
- Decision analytics: priority plus urgency task scoring.
- Responsible AI: explainable reasons, confidence scores, human approval, privacy-first data handling.

## Project Structure

```text
CogniFlow/
  cogniflow/
    data.py        # dataclasses and synthetic disclosed demo data
    nlp.py         # tokenization, TF-IDF, cosine similarity, signal extraction
    ml.py          # cognitive-state classifier and evaluation
    memory.py      # second-brain note retrieval
    planner.py     # adaptive task planner
    pipeline.py    # end-to-end AI pipeline
  main.py          # command-line demo
  train.py         # classifier training/evaluation script
  tests/           # lightweight tests
  docs/            # submission, architecture, responsible AI, pitch materials
```

## Run The Demo

```bash
cd /home/techbin/Abdul_Rehman/CogniFlow
python3 main.py
```

Press Enter at the first prompt to run the built-in sample scenario.

## Train/Evaluate The ML Classifier

```bash
cd /home/techbin/Abdul_Rehman/CogniFlow
python3 train.py
```

The training data is a small synthetic dataset written for the hackathon demo and disclosed in the project. It is not a clinical or production-grade dataset.

## Run Tests

```bash
cd /home/techbin/Abdul_Rehman/CogniFlow
python3 -m unittest discover tests
```

## AI Pipeline

```text
student check-in + tasks + notes
  -> NLP preprocessing
  -> TF-IDF features
  -> cognitive-state ML classifier
  -> second-brain note retrieval
  -> task priority/urgency scoring
  -> adaptive plan
  -> student accept/edit/reject
```

## Data Sources

- User-entered check-ins, tasks, and notes.
- Synthetic sample cases created for demonstration.
- No external datasets.
- No proprietary data.
- No scraped websites.
- No medical data.

## Responsible AI Boundary

CogniFlow is workload decision support. It is not therapy, diagnosis, medical advice, or a replacement for human judgment. Students remain in control of accepting, editing, or rejecting any plan.

