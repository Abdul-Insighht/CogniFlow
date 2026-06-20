"""Adaptive action engine."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from cogniflow_pro.memory import RetrievedNote
from cogniflow_pro.ml import Prediction
from cogniflow_pro.models import StudyLog, Task


@dataclass(frozen=True)
class PlanStep:
    action: str
    reason: str


@dataclass(frozen=True)
class Plan:
    state: str
    confidence: float
    steps: list[PlanStep]
    weak_topics: list[str]
    human_control: str
    disclaimer: str


def task_score(task: Task, today: date | None = None) -> float:
    days_until = task.days_until_due(today)
    urgency = max(0, 7 - days_until)
    effort_penalty = task.effort_minutes / 30
    return task.priority * 10 + urgency * 4 - effort_penalty


def infer_weak_topics(logs: list[StudyLog]) -> list[str]:
    weak_words = {"weak", "confused", "stuck", "hard", "difficult", "need", "again"}
    topics = []
    for log in logs:
        reflection = log.reflection.lower()
        if any(word in reflection for word in weak_words):
            topics.append(f"{log.course}: {log.topic}")
    return topics[:3]


def build_plan(prediction: Prediction, tasks: list[Task], notes: list[RetrievedNote], logs: list[StudyLog]) -> Plan:
    ranked_tasks = sorted(tasks, key=task_score, reverse=True)
    relevant_note = notes[0].note.title if notes else "your most relevant notes"
    weak_topics = infer_weak_topics(logs)

    if not ranked_tasks:
        steps = [
            PlanStep("Add your current tasks and deadlines.", "The planner needs task context."),
            PlanStep("Write a short check-in about your current state.", "NLP state detection depends on user input."),
        ]
    elif prediction.label == "overwhelmed":
        steps = [
            PlanStep(f"Work on '{ranked_tasks[0].title}' for 25 minutes only.", "High overload needs one small critical action first."),
            PlanStep(f"Open '{relevant_note}' before starting.", "Retrieved memory reduces search and decision time."),
            PlanStep("Hide or postpone non-urgent tasks until the first block is complete.", "A shorter visible list reduces cognitive load."),
        ]
        if weak_topics:
            steps.append(PlanStep(f"Rapidly revise weak topic: {weak_topics[0]}.", "Study history shows this area still needs coverage."))
    elif prediction.label == "stressed":
        steps = [
            PlanStep(f"Protect a 50-minute block for '{ranked_tasks[0].title}'.", "It has the highest priority and urgency score."),
            PlanStep(f"Review '{relevant_note}' during the first 10 minutes.", "Retrieved notes should guide the study block."),
            PlanStep("Move low-priority work after the urgent deadline.", "Stress state benefits from fewer active decisions."),
        ]
    elif prediction.label == "focused":
        steps = [
            PlanStep(f"Start 90 minutes of deep work on '{ranked_tasks[0].title}'.", "Focus state can support harder work."),
            PlanStep("Write a completion summary after the block.", "Summaries improve future second-brain retrieval."),
        ]
    else:
        steps = [
            PlanStep(f"Complete the most urgent task first: '{ranked_tasks[0].title}'.", "Neutral state uses balanced priority and deadline scoring."),
            PlanStep(f"Check '{relevant_note}' for supporting material.", "Memory retrieval connects notes to the current decision."),
        ]

    return Plan(
        state=prediction.label,
        confidence=prediction.confidence,
        steps=steps,
        weak_topics=weak_topics,
        human_control="Student must accept, edit, or reject this plan before acting on it.",
        disclaimer="CogniFlow is workload decision support, not therapy, diagnosis, or medical advice.",
    )

