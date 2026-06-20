"""Dated study-history question answering."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta

from cogniflow_pro.models import StudyLog
from cogniflow_pro.nlp import tokenize


WEEKDAYS = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}


@dataclass(frozen=True)
class HistoryAnswer:
    target_date: date | None
    logs: list[StudyLog]
    answer: str


def resolve_history_date(question: str, today: date | None = None) -> date | None:
    today = today or date.today()
    tokens = set(tokenize(question))
    if "today" in tokens:
        return today
    if "yesterday" in tokens:
        return today - timedelta(days=1)
    for weekday, index in WEEKDAYS.items():
        if weekday in tokens:
            days_back = (today.weekday() - index) % 7
            days_back = 7 if days_back == 0 else days_back
            return today - timedelta(days=days_back)
    return None


def answer_history_question(question: str, logs: list[StudyLog], today: date | None = None) -> HistoryAnswer:
    target = resolve_history_date(question, today)
    if target is None:
        return HistoryAnswer(None, [], "I could not identify a date. Ask about today, yesterday, or a weekday.")

    matches = [log for log in logs if log.study_date == target]
    if not matches:
        return HistoryAnswer(target, [], f"No study log was found for {target.isoformat()}.")

    summary = "; ".join(
        f"{log.course}: {log.topic} for {log.minutes} minutes ({log.reflection})"
        for log in matches
    )
    return HistoryAnswer(target, matches, f"On {target.isoformat()}, you studied {summary}.")

