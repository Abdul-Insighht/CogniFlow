"""End-to-end CogniFlow Pro pipeline."""

from __future__ import annotations

from dataclasses import dataclass

from cogniflow_pro.history import HistoryAnswer, answer_history_question
from cogniflow_pro.memory import MemoryEngine, RetrievedNote
from cogniflow_pro.ml import CognitiveStateClassifier, Prediction
from cogniflow_pro.models import StudentCase
from cogniflow_pro.planner import Plan, build_plan, infer_weak_topics, task_score
from cogniflow_pro.sample_data import synthetic_training_cases


@dataclass(frozen=True)
class PipelineResult:
    prediction: Prediction
    retrieved_notes: list[RetrievedNote]
    history_answer: HistoryAnswer | None
    plan: Plan


class CogniFlowProPipeline:
    def __init__(self, retrieval_mode: str = "tfidf") -> None:
        self.retrieval_mode = retrieval_mode
        self.classifier = CognitiveStateClassifier()
        self.classifier.train(synthetic_training_cases())

    def run(self, case: StudentCase, history_question: str | None = None) -> PipelineResult:
        urgent_tasks = sum(task.days_until_due() <= 1 for task in case.tasks)
        prediction = self.classifier.predict(case.check_in, len(case.tasks), urgent_tasks)

        memory = MemoryEngine(case.notes, mode=self.retrieval_mode)
        ranked_tasks = sorted(case.tasks, key=task_score, reverse=True)
        weighted_task_terms = []
        for index, task in enumerate(ranked_tasks):
            weight = max(task.priority, 1)
            if index == 0:
                weight *= 3
            weighted_task_terms.extend([task.title, task.course] * weight)
        weak_topic_terms = infer_weak_topics(case.study_logs)
        query = " ".join(weighted_task_terms + weak_topic_terms + [case.check_in])
        retrieved_notes = memory.search(query)

        history_answer = answer_history_question(history_question, case.study_logs) if history_question else None
        plan = build_plan(prediction, case.tasks, retrieved_notes, case.study_logs)

        return PipelineResult(prediction, retrieved_notes, history_answer, plan)

