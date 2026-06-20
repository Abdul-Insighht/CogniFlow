# CogniFlow Pro

This is the upgraded Python AI version of CogniFlow. It adds the missing recommended pieces:

- SQLite persistence for notes, tasks, and study logs.
- Dated study history, including questions like `What did I study yesterday?`
- Larger synthetic training dataset.
- NLP + TF-IDF + Naive Bayes cognitive-state classifier.
- Local second-brain retrieval with TF-IDF.
- Optional local hashing-vector retrieval mode.
- Weak-topic detection from study logs.
- Optional Streamlit UI.

## Run CLI Demo

```bash
cd /home/techbin/Abdul_Rehman/CogniFlow
python3 main_pro.py
```

Press Enter at `Check-in:` to run the full built-in sample.

## Train/Evaluate

```bash
python3 train_pro.py
```

## Run Tests

```bash
python3 -m unittest discover tests
```

## Optional UI

Only if Streamlit is installed:

```bash
streamlit run streamlit_app.py
```

## Honest Technical Claim

CogniFlow Pro is a working Python AI prototype. It demonstrates the complete concept through local NLP, ML classification, retrieval, persistent storage, study-history reasoning, and adaptive planning. It is not a clinical mental-health system and should be submitted as decision support, not therapy.

