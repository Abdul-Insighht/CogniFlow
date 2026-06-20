"""End-to-end CogniFlow AI pipeline."""

from __future__ import annotations

from dataclasses import dataclass

from cogniflow.data import StudentCase, synthetic_training_cases
from cogniflow.memory import MemoryEngine, RetrievedNote
from cogniflow.ml import CognitiveStateClassifier, Prediction
from cogniflow.planner import Plan, build_plan


@dataclass(frozen=True)
class PipelineResult:
    prediction: Prediction
    retrieved_notes: list[RetrievedNote]
    plan: Plan


class CogniFlowPipeline:
    def __init__(self) -> None:
        self.classifier = CognitiveStateClassifier()
        self.classifier.train(synthetic_training_cases())

    def run(self, case: StudentCase) -> PipelineResult:
        urgent_tasks = sum(task.days_until_due() <= 1 for task in case.tasks)
        prediction = self.classifier.predict(
            check_in=case.check_in,
            tasks_count=len(case.tasks),
            urgent_tasks=urgent_tasks,
        )
        memory = MemoryEngine(case.notes)
        query = " ".join([case.check_in] + [task.title for task in case.tasks])
        retrieved_notes = memory.search(query)
        plan = build_plan(prediction, case.tasks, retrieved_notes)
        return PipelineResult(prediction=prediction, retrieved_notes=retrieved_notes, plan=plan)

