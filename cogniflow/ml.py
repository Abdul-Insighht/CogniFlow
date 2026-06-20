"""Machine learning layer for cognitive-state classification."""

from __future__ import annotations

import math
from collections import Counter, defaultdict
from dataclasses import dataclass

from cogniflow.data import StudentCase
from cogniflow.nlp import TfidfVectorizer, extract_text_signals


LABELS = ["focused", "neutral", "stressed", "overwhelmed"]


@dataclass(frozen=True)
class Prediction:
    label: str
    confidence: float
    probabilities: dict[str, float]
    reasons: list[str]


class CognitiveStateClassifier:
    """Multinomial Naive Bayes classifier with workload-aware scoring."""

    def __init__(self) -> None:
        self.vectorizer = TfidfVectorizer()
        self.label_counts: Counter[str] = Counter()
        self.term_counts: dict[str, Counter[str]] = defaultdict(Counter)
        self.term_totals: Counter[str] = Counter()
        self.vocabulary: set[str] = set()
        self.is_trained = False

    def train(self, cases: list[StudentCase]) -> None:
        documents = [case.check_in for case in cases]
        vectors = self.vectorizer.fit_transform(documents)
        for case, vector in zip(cases, vectors):
            self.label_counts[case.label] += 1
            for term, value in vector.items():
                weighted_count = max(1, round(value * 10))
                self.term_counts[case.label][term] += weighted_count
                self.term_totals[case.label] += weighted_count
                self.vocabulary.add(term)
        self.is_trained = True

    def predict(self, check_in: str, tasks_count: int, urgent_tasks: int) -> Prediction:
        if not self.is_trained:
            raise RuntimeError("Classifier must be trained before prediction.")

        vector = self.vectorizer.transform_one(check_in)
        vocab_size = max(len(self.vocabulary), 1)
        total_cases = sum(self.label_counts.values())
        scores: dict[str, float] = {}

        for label in LABELS:
            prior = (self.label_counts[label] + 1) / (total_cases + len(LABELS))
            score = math.log(prior)
            denominator = self.term_totals[label] + vocab_size
            for term, value in vector.items():
                count = self.term_counts[label][term] + 1
                score += value * math.log(count / denominator)
            score += self._workload_adjustment(label, tasks_count, urgent_tasks)
            scores[label] = score

        probabilities = softmax(scores)
        label = max(probabilities, key=probabilities.get)
        return Prediction(
            label=label,
            confidence=probabilities[label],
            probabilities=probabilities,
            reasons=self._reasons(check_in, tasks_count, urgent_tasks),
        )

    @staticmethod
    def _workload_adjustment(label: str, tasks_count: int, urgent_tasks: int) -> float:
        pressure = tasks_count * 0.18 + urgent_tasks * 0.45
        if label == "overwhelmed":
            return pressure
        if label == "stressed":
            return pressure * 0.55
        if label == "focused":
            return -pressure * 0.35
        return -abs(pressure - 0.4) * 0.15

    @staticmethod
    def _reasons(check_in: str, tasks_count: int, urgent_tasks: int) -> list[str]:
        signals = extract_text_signals(check_in)
        reasons = []
        if signals.stress_hits:
            reasons.append("stress terms: " + ", ".join(signals.stress_hits))
        if signals.focus_hits:
            reasons.append("focus terms: " + ", ".join(signals.focus_hits))
        if urgent_tasks:
            reasons.append(f"{urgent_tasks} task(s) due within 24 hours")
        reasons.append(f"{tasks_count} active task(s)")
        if signals.word_count > 35:
            reasons.append("long check-in suggests high cognitive load")
        return reasons


def softmax(scores: dict[str, float]) -> dict[str, float]:
    max_score = max(scores.values())
    exp_scores = {label: math.exp(score - max_score) for label, score in scores.items()}
    total = sum(exp_scores.values())
    return {label: value / total for label, value in exp_scores.items()}


def evaluate_classifier(classifier: CognitiveStateClassifier, cases: list[StudentCase]) -> dict[str, object]:
    correct = 0
    matrix: dict[str, Counter[str]] = {label: Counter() for label in LABELS}
    for case in cases:
        urgent = sum(task.days_until_due() <= 1 for task in case.tasks)
        prediction = classifier.predict(case.check_in, len(case.tasks), urgent)
        matrix[case.label][prediction.label] += 1
        if prediction.label == case.label:
            correct += 1
    return {
        "accuracy": correct / max(len(cases), 1),
        "confusion_matrix": {label: dict(row) for label, row in matrix.items()},
        "num_cases": len(cases),
    }

