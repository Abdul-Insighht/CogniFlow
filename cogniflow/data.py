"""Data models and synthetic demo data for CogniFlow."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta


@dataclass(frozen=True)
class Task:
    title: str
    course: str
    due_date: date
    priority: int
    effort_minutes: int

    def days_until_due(self, today: date | None = None) -> int:
        today = today or date.today()
        return (self.due_date - today).days


@dataclass(frozen=True)
class Note:
    title: str
    body: str
    source: str = "user_input"


@dataclass(frozen=True)
class StudentCase:
    check_in: str
    tasks: list[Task]
    notes: list[Note]
    label: str


def sample_case() -> StudentCase:
    today = date.today()
    return StudentCase(
        check_in=(
            "I have a database quiz tomorrow, an AI assignment due tonight, "
            "and a family event. I feel overwhelmed and I don't know what to "
            "study first. I revised SQL but normalization is still weak."
        ),
        tasks=[
            Task("Revise DBMS normalization", "DBMS", today + timedelta(days=1), 5, 30),
            Task("Finish AI assignment guardrails", "AI", today, 4, 60),
            Task("Read operating systems chapter", "OS", today + timedelta(days=4), 2, 90),
        ],
        notes=[
            Note("DBMS weak topics", "Normalization, functional dependency, and transaction isolation need revision before the quiz."),
            Note("AI assignment rubric", "Explain NLP, pattern detection, responsible AI guardrails, and human-in-the-loop design."),
        ],
        label="overwhelmed",
    )


def synthetic_training_cases() -> list[StudentCase]:
    today = date.today()
    notes = [
        Note("Study strategy", "Use active recall and short breaks during revision."),
        Note("Responsible AI", "Keep user control, privacy, transparency, and failure handling visible."),
    ]
    rows = [
        ("I am calm and focused. I finished the reading and want to start the hardest assignment now.", "focused", [Task("Write machine learning report", "ML", today + timedelta(days=5), 4, 90)]),
        ("I feel prepared for the quiz and have a clear plan for revision.", "focused", [Task("Practice probability questions", "Stats", today + timedelta(days=3), 3, 45)]),
        ("I completed my notes and feel productive. I can do deep work now.", "focused", [Task("Build project prototype", "AI", today + timedelta(days=7), 5, 120)]),
        ("I have two tasks this week and I need to decide the order.", "neutral", [Task("Read chapter 4", "OS", today + timedelta(days=3), 3, 60)]),
        ("I need help organizing tasks for next week.", "neutral", [Task("Plan semester calendar", "General", today + timedelta(days=6), 2, 45)]),
        ("I am not panicking but I have a deadline tomorrow and need a schedule.", "stressed", [Task("Submit database lab", "DBMS", today + timedelta(days=1), 4, 60)]),
        ("I am stressed because the assignment is late and I am confused about the rubric.", "stressed", [Task("Complete AI assignment", "AI", today, 4, 90)]),
        ("I have a deadline and some pressure, but I know the next step.", "stressed", [Task("Polish presentation", "English", today + timedelta(days=1), 3, 30)]),
        ("I feel overwhelmed, exhausted, and stuck. There are too many deadlines and I cannot prioritize.", "overwhelmed", [Task("Prepare calculus quiz", "Math", today, 5, 60), Task("Finish programming lab", "Programming", today + timedelta(days=1), 5, 120)]),
        ("I have no idea what to study. I am panicked, tired, and afraid I will fail tomorrow.", "overwhelmed", [Task("Revise final exam topics", "Networks", today + timedelta(days=1), 5, 120)]),
    ]
    return [StudentCase(check_in=text, tasks=tasks, notes=notes, label=label) for text, label, tasks in rows]

