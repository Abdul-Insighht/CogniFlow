"""Second-brain retrieval engine."""

from __future__ import annotations

from dataclasses import dataclass

from cogniflow.data import Note
from cogniflow.nlp import TfidfVectorizer, cosine_similarity


@dataclass(frozen=True)
class RetrievedNote:
    note: Note
    score: float


class MemoryEngine:
    """Local note retrieval using TF-IDF cosine similarity."""

    def __init__(self, notes: list[Note]) -> None:
        self.notes = notes
        self.documents = [f"{note.title} {note.body}" for note in notes]
        self.vectorizer = TfidfVectorizer()
        self.vectors = self.vectorizer.fit_transform(self.documents) if notes else []

    def search(self, query: str, limit: int = 3) -> list[RetrievedNote]:
        if not self.notes:
            return []
        query_vector = self.vectorizer.transform_one(query)
        ranked = [
            RetrievedNote(note=note, score=cosine_similarity(query_vector, vector))
            for note, vector in zip(self.notes, self.vectors)
        ]
        return [
            item for item in sorted(ranked, key=lambda result: result.score, reverse=True)
            if item.score > 0
        ][:limit]

