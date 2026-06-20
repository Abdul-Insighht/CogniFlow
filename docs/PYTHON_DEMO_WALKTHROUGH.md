# Python Demo Walkthrough

## Run Sample Demo

```bash
cd /home/techbin/Abdul_Rehman/CogniFlow
python3 main.py
```

At the prompt, press Enter to run the built-in sample.

## What To Show Judges

1. The input check-in describes a stressed student with a quiz, assignment, and weak topic.
2. CogniFlow lists structured tasks with deadline, priority, and effort features.
3. The ML classifier predicts a cognitive state.
4. The output includes confidence and reasons, such as stress terms and urgent deadlines.
5. The memory engine retrieves relevant notes.
6. The planner creates a state-aware action plan.
7. The output explicitly states that the student must accept, edit, or reject the plan.

## Train/Evaluate Classifier

```bash
cd /home/techbin/Abdul_Rehman/CogniFlow
python3 train.py
```

This prints:

- Number of synthetic training cases.
- Training-set accuracy.
- Confusion matrix.
- Responsible AI warning that this is not a clinical model.

## Run Tests

```bash
cd /home/techbin/Abdul_Rehman/CogniFlow
python3 -m unittest discover tests
```

## Pitch Framing

Say: "CogniFlow is built as a Python AI pipeline. It uses NLP features, a transparent machine-learning classifier, retrieval over student notes, and decision analytics to produce a human-approved study plan."

