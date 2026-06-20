"""Second-brain retrieval with TF-IDF and local vector fallback."""

from __future__ import annotations

from dataclasses import dataclass

from cogniflow_pro.models import Note
from cogniflow_pro.nlp import HashingEmbeddingModel, TfidfVectorizer, cosine_similarity


@dataclass(frozen=True)
class RetrievedNote:
    note: Note
    score: float
    method: str


class MemoryEngine:
    """Local retrieval engine.

    `mode="tfidf"` uses classic information retrieval.
    `mode="hashing"` uses deterministic local embeddings. It is not as strong as
    sentence-transformers, but it demonstrates vector retrieval without external
    dependencies or network calls.
    """

    def __init__(self, notes: list[Note], mode: str = "tfidf") -> None:
        self.notes = notes
        self.mode = mode
        self.documents = [f"{note.title} {note.body}" for note in notes]
        if mode == "hashing":
            self.embedding_model = HashingEmbeddingModel()
            self.vectors = [self.embedding_model.encode_one(document) for document in self.documents]
            self.vectorizer = None
        else:
            self.vectorizer = TfidfVectorizer()
            self.vectors = self.vectorizer.fit_transform(self.documents) if notes else []
            self.embedding_model = None

    def search(self, query: str, limit: int = 3) -> list[RetrievedNote]:
        if not self.notes:
            return []
        if self.mode == "hashing":
            assert self.embedding_model is not None
            query_vector = self.embedding_model.encode_one(query)
        else:
            assert self.vectorizer is not None
            query_vector = self.vectorizer.transform_one(query)

        ranked = [
            RetrievedNote(note, cosine_similarity(query_vector, vector), self.mode)
            for note, vector in zip(self.notes, self.vectors)
        ]
        return [
            item for item in sorted(ranked, key=lambda result: result.score, reverse=True)
            if item.score > 0
        ][:limit]

