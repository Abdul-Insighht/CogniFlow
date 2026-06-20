"""NLP utilities for CogniFlow."""

from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass


TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z']+")

STRESS_TERMS = {
    "stress", "stressed", "panic", "panicked", "overwhelmed", "anxious",
    "confused", "tired", "exhausted", "burnout", "late", "deadline",
    "deadlines", "missed", "stuck", "worried", "afraid", "pressure", "fail",
}

FOCUS_TERMS = {
    "focused", "ready", "clear", "confident", "prepared", "calm",
    "productive", "revised", "finished", "planned", "understand",
}


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_RE.findall(text)]


def term_counts(text: str) -> Counter[str]:
    return Counter(tokenize(text))


def cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    keys = set(left) | set(right)
    dot = sum(left.get(key, 0.0) * right.get(key, 0.0) for key in keys)
    mag_left = math.sqrt(sum(value * value for value in left.values()))
    mag_right = math.sqrt(sum(value * value for value in right.values()))
    if mag_left == 0 or mag_right == 0:
        return 0.0
    return dot / (mag_left * mag_right)


class TfidfVectorizer:
    """Small TF-IDF vectorizer implemented from scratch for offline use."""

    def __init__(self) -> None:
        self.idf_: dict[str, float] = {}

    def fit(self, documents: list[str]) -> "TfidfVectorizer":
        doc_count = max(len(documents), 1)
        document_frequency: Counter[str] = Counter()
        for document in documents:
            document_frequency.update(set(tokenize(document)))
        self.idf_ = {
            term: math.log((1 + doc_count) / (1 + frequency)) + 1
            for term, frequency in document_frequency.items()
        }
        return self

    def transform_one(self, document: str) -> dict[str, float]:
        counts = term_counts(document)
        total = sum(counts.values()) or 1
        return {
            term: (count / total) * self.idf_.get(term, 1.0)
            for term, count in counts.items()
        }

    def transform(self, documents: list[str]) -> list[dict[str, float]]:
        return [self.transform_one(document) for document in documents]

    def fit_transform(self, documents: list[str]) -> list[dict[str, float]]:
        self.fit(documents)
        return self.transform(documents)


@dataclass(frozen=True)
class TextSignals:
    stress_hits: list[str]
    focus_hits: list[str]
    word_count: int
    question_marks: int


def extract_text_signals(text: str) -> TextSignals:
    token_set = set(tokenize(text))
    return TextSignals(
        stress_hits=sorted(token_set & STRESS_TERMS),
        focus_hits=sorted(token_set & FOCUS_TERMS),
        word_count=len(tokenize(text)),
        question_marks=text.count("?"),
    )

