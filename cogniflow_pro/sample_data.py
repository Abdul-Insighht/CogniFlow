"""Synthetic demo data disclosed for hackathon use."""

from __future__ import annotations

from datetime import date, timedelta

from cogniflow_pro.models import Note, StudentCase, StudyLog, Task


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
            Note("DBMS revision checklist", "Prioritize normalization, SQL joins, ER diagrams, and transaction isolation."),
        ],
        study_logs=[
            StudyLog(today - timedelta(days=1), "DBMS", "SQL joins and basic normalization", 45, "SQL was okay, but 2NF and 3NF still felt weak."),
            StudyLog(today - timedelta(days=2), "AI", "Responsible AI guardrails", 35, "Understood privacy and human-in-the-loop examples."),
            StudyLog(today - timedelta(days=7), "DBMS", "Entity relationship diagrams", 30, "Need one more practice question."),
        ],
        label="overwhelmed",
    )


def synthetic_training_cases() -> list[StudentCase]:
    today = date.today()
    notes = [Note("General", "Synthetic demo row.")]
    logs = [StudyLog(today - timedelta(days=1), "General", "Planning", 20, "Created task order.")]
    rows = [
        ("I am calm and focused. I finished the reading and want to start the hardest assignment now.", "focused", [Task("Write machine learning report", "ML", today + timedelta(days=5), 4, 90)]),
        ("I feel prepared for the quiz and have a clear plan for revision.", "focused", [Task("Practice probability questions", "Stats", today + timedelta(days=3), 3, 45)]),
        ("I completed my notes and feel productive. I can do deep work now.", "focused", [Task("Build project prototype", "AI", today + timedelta(days=7), 5, 120)]),
        ("My mind is clear and I already know the next two steps for my project.", "focused", [Task("Implement retrieval module", "AI", today + timedelta(days=4), 4, 80)]),
        ("I revised yesterday and feel confident about today's practice session.", "focused", [Task("Solve past paper", "Math", today + timedelta(days=2), 4, 60)]),
        ("I have two tasks this week and I need to decide the order.", "neutral", [Task("Read chapter 4", "OS", today + timedelta(days=3), 3, 60)]),
        ("I need help organizing tasks for next week.", "neutral", [Task("Plan semester calendar", "General", today + timedelta(days=6), 2, 45)]),
        ("I have normal workload today and want a simple study order.", "neutral", [Task("Review lecture slides", "Networks", today + timedelta(days=3), 3, 45)]),
        ("Nothing is urgent, but I want to plan revision before the weekend.", "neutral", [Task("Create revision outline", "DBMS", today + timedelta(days=5), 2, 30)]),
        ("I am not panicking but I have a deadline tomorrow and need a schedule.", "stressed", [Task("Submit database lab", "DBMS", today + timedelta(days=1), 4, 60)]),
        ("I am stressed because the assignment is late and I am confused about the rubric.", "stressed", [Task("Complete AI assignment", "AI", today, 4, 90)]),
        ("I have a deadline and some pressure, but I know the next step.", "stressed", [Task("Polish presentation", "English", today + timedelta(days=1), 3, 30)]),
        ("I am worried about tomorrow's quiz and need a fast revision plan.", "stressed", [Task("Revise statistics quiz", "Stats", today + timedelta(days=1), 4, 50)]),
        ("I feel tense because my project demo is soon and I still need to test it.", "stressed", [Task("Test final prototype", "AI", today + timedelta(days=1), 5, 70)]),
        ("I feel overwhelmed, exhausted, and stuck. There are too many deadlines and I cannot prioritize.", "overwhelmed", [Task("Prepare calculus quiz", "Math", today, 5, 60), Task("Finish programming lab", "Programming", today + timedelta(days=1), 5, 120)]),
        ("I have no idea what to study. I am panicked, tired, and afraid I will fail tomorrow.", "overwhelmed", [Task("Revise final exam topics", "Networks", today + timedelta(days=1), 5, 120)]),
        ("I am exhausted and confused because I have three deadlines tomorrow and cannot decide what to do first.", "overwhelmed", [Task("Submit AI assignment", "AI", today + timedelta(days=1), 5, 90)]),
        ("I feel burned out and stuck because every subject looks urgent right now.", "overwhelmed", [Task("Prepare mixed revision", "General", today, 5, 120)]),
    ]
    return [StudentCase(text, tasks, notes, logs, label) for text, label, tasks in rows]

