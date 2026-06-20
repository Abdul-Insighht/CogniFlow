"""Adaptive decision-support planner."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from cogniflow.data import Task
from cogniflow.memory import RetrievedNote
from cogniflow.ml import Prediction


@dataclass(frozen=True)
class PlanStep:
    action: str
    reason: str


@dataclass(frozen=True)
class Plan:
    state: str
    confidence: float
    steps: list[PlanStep]
    human_control: str
    disclaimer: str


def task_score(task: Task, today: date | None = None) -> float:
    days_until = task.days_until_due(today)
    urgency = max(0, 7 - days_until)
    effort_penalty = task.effort_minutes / 30
    return task.priority * 10 + urgency * 4 - effort_penalty


def build_plan(prediction: Prediction, tasks: list[Task], notes: list[RetrievedNote]) -> Plan:
    ranked_tasks = sorted(tasks, key=task_score, reverse=True)
    relevant_note = notes[0].note.title if notes else "your most relevant notes"

    if not ranked_tasks:
        steps = [
            PlanStep("Add your current tasks and deadlines.", "The planner needs task context."),
            PlanStep("Write a short check-in about your current state.", "NLP state detection depends on user input."),
        ]
    elif prediction.label == "overwhelmed":
        steps = [
            PlanStep(f"Work on '{ranked_tasks[0].title}' for only 25 minutes.", "High overload means one small critical action first."),
            PlanStep(f"Use '{relevant_note}' before starting.", "Retrieval found memory that can reduce search time."),
            PlanStep("Hide or postpone non-urgent tasks until this block is complete.", "A shorter visible list reduces cognitive load."),
        ]
    elif prediction.label == "stressed":
        steps = [
            PlanStep(f"Protect a 50-minute block for '{ranked_tasks[0].title}'.", "The task has the highest priority and urgency."),
            PlanStep(f"Review '{relevant_note}' during the first 10 minutes.", "Retrieved notes should guide the study block."),
            PlanStep("Move low-priority work after the urgent deadline.", "Stress state benefits from fewer active decisions."),
        ]
    elif prediction.label == "focused":
        steps = [
            PlanStep(f"Start deep work on '{ranked_tasks[0].title}' for 90 minutes.", "Focus state can support harder work."),
            PlanStep("Write a short completion summary after the block.", "Summaries improve future memory retrieval."),
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
        human_control="Student must accept, edit, or reject this plan before acting on it.",
        disclaimer="CogniFlow is workload decision support, not therapy, diagnosis, or medical advice.",
    )

