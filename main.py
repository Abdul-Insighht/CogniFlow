"""Command-line demo for CogniFlow."""

from __future__ import annotations

from datetime import date, timedelta

from cogniflow.data import Note, StudentCase, Task, sample_case
from cogniflow.pipeline import CogniFlowPipeline


def run_demo(case: StudentCase | None = None) -> None:
    case = case or sample_case()
    pipeline = CogniFlowPipeline()
    result = pipeline.run(case)

    print("\nCogniFlow AI Decision Support Demo")
    print("=" * 40)
    print("\nStudent check-in:")
    print(case.check_in)

    print("\nTasks:")
    for task in case.tasks:
        print(
            f"- {task.title} | course={task.course} | due_in={task.days_until_due()} day(s) "
            f"| priority={task.priority}/5 | effort={task.effort_minutes} min"
        )

    print("\nPredicted cognitive state:")
    print(f"- state: {result.prediction.label}")
    print(f"- confidence: {result.prediction.confidence:.2f}")
    print("- reasons:")
    for reason in result.prediction.reasons:
        print(f"  * {reason}")

    print("\nRetrieved second-brain notes:")
    if result.retrieved_notes:
        for item in result.retrieved_notes:
            print(f"- {item.note.title} | score={item.score:.2f}")
            print(f"  {item.note.body}")
    else:
        print("- No relevant note found.")

    print("\nAdaptive plan:")
    for index, step in enumerate(result.plan.steps, start=1):
        print(f"{index}. {step.action}")
        print(f"   Reason: {step.reason}")

    print("\nHuman-in-the-loop:")
    print(result.plan.human_control)
    print("\nResponsible AI boundary:")
    print(result.plan.disclaimer)


def interactive_demo() -> None:
    print("CogniFlow Interactive Mode")
    print("Leave check-in blank to use the built-in sample.\n")
    check_in = input("Check-in: ").strip()
    if not check_in:
        run_demo()
        return

    title = input("Most urgent task title: ").strip() or "Study urgent topic"
    course = input("Course: ").strip() or "General"
    priority = int(input("Priority 1-5: ").strip() or "4")
    effort = int(input("Effort minutes: ").strip() or "45")
    note_title = input("Relevant note title: ").strip() or "User note"
    note_body = input("Relevant note body: ").strip() or "No note details provided."

    case = StudentCase(
        check_in=check_in,
        tasks=[Task(title, course, date.today() + timedelta(days=1), priority, effort)],
        notes=[Note(note_title, note_body)],
        label="unknown",
    )
    run_demo(case)


if __name__ == "__main__":
    interactive_demo()

