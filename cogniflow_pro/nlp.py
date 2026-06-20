"""NLP, TF-IDF, and optional embedding helpers."""

from __future__ import annotations

import hashlib
import math
import re
from collections import Counter
from dataclasses import dataclass


TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z']+")

STRESS_TERMS = {
    "stress", "stressed", "panic", "panicked", "overwhelmed", "anxious",
    "confused", "tired", "exhausted", "burnout", "late", "deadline",
    "deadlines", "missed", "stuck", "worried", "afraid", "pressure",
    "fail", "crying", "lost", "cannot", "can't",
}

FOCUS_TERMS = {
    "focused", "ready", "clear", "confident", "prepared", "calm",
    "productive", "revised", "finished", "planned", "understand",
    "flow", "motivated",
}


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_RE.findall(text)]


def cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    keys = set(left) | set(right)
    dot = sum(left.get(key, 0.0) * right.get(key, 0.0) for key in keys)
    mag_left = math.sqrt(sum(value * value for value in left.values()))
    mag_right = math.sqrt(sum(value * value for value in right.values()))
    if mag_left == 0 or mag_right == 0:
        return 0.0
    return dot / (mag_left * mag_right)


class TfidfVectorizer:
    def __init__(self) -> None:
        self.idf_: dict[str, float] = {}

    def fit(self, documents: list[str]) -> "TfidfVectorizer":
        doc_count = max(len(documents), 1)
        df: Counter[str] = Counter()
        for document in documents:
            df.update(set(tokenize(document)))
        self.idf_ = {
            term: math.log((1 + doc_count) / (1 + count)) + 1
            for term, count in df.items()
        }
        return self

    def transform_one(self, document: str) -> dict[str, float]:
        counts = Counter(tokenize(document))
        total = sum(counts.values()) or 1
        return {
            term: (count / total) * self.idf_.get(term, 1.0)
            for term, count in counts.items()
        }

    def fit_transform(self, documents: list[str]) -> list[dict[str, float]]:
        self.fit(documents)
        return [self.transform_one(document) for document in documents]


class HashingEmbeddingModel:
    """Deterministic local embedding fallback with no external dependency."""

    def __init__(self, dimensions: int = 128) -> None:
        self.dimensions = dimensions

    def encode_one(self, text: str) -> dict[str, float]:
        vector: dict[str, float] = {}
        for token in tokenize(text):
            digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
            index = int(digest[:8], 16) % self.dimensions
            key = f"d{index}"
            vector[key] = vector.get(key, 0.0) + 1.0
        return vector


@dataclass(frozen=True)
class TextSignals:
    stress_hits: list[str]
    focus_hits: list[str]
    word_count: int
    question_marks: int


def extract_text_signals(text: str) -> TextSignals:
    tokens = tokenize(text)
    token_set = set(tokens)
    return TextSignals(
        stress_hits=sorted(token_set & STRESS_TERMS),
        focus_hits=sorted(token_set & FOCUS_TERMS),
        word_count=len(tokens),
        question_marks=text.count("?"),
    )

