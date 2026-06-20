"""Core data models for CogniFlow Pro."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date


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
class StudyLog:
    study_date: date
    course: str
    topic: str
    minutes: int
    reflection: str


@dataclass(frozen=True)
class StudentCase:
    check_in: str
    tasks: list[Task]
    notes: list[Note]
    study_logs: list[StudyLog]
    label: str = "unknown"

