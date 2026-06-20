"""CogniFlow Pro command-line demo."""

from __future__ import annotations

import argparse
from datetime import date, timedelta
from pathlib import Path

from cogniflow_pro.models import Note, StudentCase, StudyLog, Task
from cogniflow_pro.nlp import tokenize
from cogniflow_pro.pipeline import CogniFlowProPipeline
from cogniflow_pro.sample_data import sample_case
from cogniflow_pro.storage import CogniFlowStore

DEMO_DB_PATH = Path("cogniflow_demo.db")
MIN_CHECK_IN_WORDS = 5


def is_valid_check_in(check_in: str) -> bool:
    return len(tokenize(check_in)) >= MIN_CHECK_IN_WORDS


def save_case(store: CogniFlowStore, case: StudentCase) -> None:
    for note in case.notes:
        store.add_note(note)
    for task in case.tasks:
        store.add_task(task)
    for log in case.study_logs:
        store.add_study_log(log)


def reset_demo_database(db_path: str | Path = DEMO_DB_PATH) -> None:
    store = CogniFlowStore(db_path)
    store.clear_all()
    store.close()


def run_demo(
    case: StudentCase | None = None,
    history_question: str | None = None,
    *,
    custom_mode: bool = False,
    db_path: str | Path = DEMO_DB_PATH,
) -> None:
    current_case = case or sample_case()
    store = CogniFlowStore(db_path)

    if custom_mode:
        save_case(store, current_case)
    else:
        store.seed_if_empty(current_case.notes, current_case.tasks, current_case.study_logs)

    pipeline = CogniFlowProPipeline(retrieval_mode="tfidf")
    result = pipeline.run(current_case, history_question=history_question)

    print("\nCogniFlow Pro AI Decision Support Demo")
    print("=" * 48)
    print("\nPersistent storage:")
    print(f"- SQLite database: {store.db_path}")
    print(f"- Notes used this run: {len(current_case.notes)}")
    print(f"- Tasks used this run: {len(current_case.tasks)}")
    print(f"- Study logs used this run: {len(current_case.study_logs)}")

    print("\nStudent check-in:")
    print(current_case.check_in)

    print("\nPredicted cognitive state:")
    print(f"- state: {result.prediction.label}")
    print(f"- confidence: {result.prediction.confidence:.2f}")
    for reason in result.prediction.reasons:
        print(f"  * {reason}")

    print("\nRetrieved second-brain notes:")
    for item in result.retrieved_notes:
        print(f"- {item.note.title} | score={item.score:.2f} | method={item.method}")
        print(f"  {item.note.body}")

    if result.history_answer:
        print("\nStudy-history answer:")
        print(result.history_answer.answer)

    if result.plan.weak_topics:
        print("\nWeak topics from study history:")
        for topic in result.plan.weak_topics:
            print(f"- {topic}")

    print("\nAdaptive plan:")
    for index, step in enumerate(result.plan.steps, start=1):
        print(f"{index}. {step.action}")
        print(f"   Reason: {step.reason}")

    print("\nHuman-in-the-loop:")
    print(result.plan.human_control)
    print("\nResponsible AI boundary:")
    print(result.plan.disclaimer)
    store.close()


def prompt_for_check_in() -> str:
    while True:
        check_in = input("Check-in: ").strip()
        if not check_in or is_valid_check_in(check_in):
            return check_in
        print("Please enter a real check-in sentence, for example: I feel stressed because my DBMS quiz is tomorrow and normalization is weak.")


def interactive_demo() -> None:
    print("CogniFlow Pro Interactive Mode")
    print("Leave check-in blank to use the richer built-in sample.\n")
    check_in = prompt_for_check_in()
    if not check_in:
        run_demo(history_question="What did I study yesterday?")
        return

    title = input("Most urgent task title: ").strip() or "Study urgent topic"
    course = input("Course: ").strip() or "General"
    priority = int(input("Priority 1-5: ").strip() or "4")
    effort = int(input("Effort minutes: ").strip() or "45")
    note_title = input("Relevant note title: ").strip() or "User note"
    note_body = input("Relevant note body: ").strip() or "No note details provided."
    history_question = input("History question, e.g. What did I study yesterday?: ").strip() or None

    case = StudentCase(
        check_in=check_in,
        tasks=[Task(title, course, date.today() + timedelta(days=1), priority, effort)],
        notes=[Note(note_title, note_body)],
        study_logs=[StudyLog(date.today() - timedelta(days=1), course, title, effort, "User-entered demo log.")],
    )
    run_demo(case, history_question=history_question, custom_mode=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the CogniFlow Pro CLI demo.")
    parser.add_argument("--reset", action="store_true", help="Clear the demo SQLite database and exit.")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    if args.reset:
        reset_demo_database()
        print(f"Cleared demo database: {DEMO_DB_PATH}")
    else:
        interactive_demo()
