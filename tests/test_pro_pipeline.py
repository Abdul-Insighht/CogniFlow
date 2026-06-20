import io
import tempfile
import unittest
from datetime import date, timedelta
from contextlib import redirect_stdout
from pathlib import Path

from cogniflow_pro.history import answer_history_question
from cogniflow_pro.memory import MemoryEngine
from cogniflow_pro.models import Note, StudentCase, StudyLog, Task
from cogniflow_pro.pipeline import CogniFlowProPipeline
from cogniflow_pro.sample_data import sample_case, synthetic_training_cases
from cogniflow_pro.storage import CogniFlowStore
from cogniflow_pro.ml import CognitiveStateClassifier, evaluate_classifier
from main_pro import is_valid_check_in, reset_demo_database, run_demo


class CogniFlowProTest(unittest.TestCase):
    def test_pro_pipeline_returns_history_and_plan(self) -> None:
        result = CogniFlowProPipeline().run(sample_case(), "What did I study yesterday?")
        self.assertEqual(result.prediction.label, "overwhelmed")
        self.assertTrue(result.retrieved_notes)
        self.assertIsNotNone(result.history_answer)
        self.assertTrue(result.plan.steps)

    def test_hashing_retrieval_works(self) -> None:
        case = sample_case()
        results = MemoryEngine(case.notes, mode="hashing").search("normalization database quiz")
        self.assertTrue(results)

    def test_history_question_yesterday(self) -> None:
        case = sample_case()
        answer = answer_history_question("What did I study yesterday?", case.study_logs)
        self.assertIn("studied", answer.answer)

    def test_sqlite_storage_roundtrip(self) -> None:
        case = sample_case()
        with tempfile.TemporaryDirectory() as tempdir:
            db_path = Path(tempdir) / "test.db"
            store = CogniFlowStore(db_path)
            store.seed_if_empty(case.notes, case.tasks, case.study_logs)
            self.assertEqual(len(store.list_notes()), len(case.notes))
            self.assertEqual(len(store.list_tasks()), len(case.tasks))
            self.assertEqual(len(store.list_study_logs()), len(case.study_logs))
            store.close()


    def test_custom_demo_uses_current_input_not_stale_database(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            db_path = Path(tempdir) / "demo.db"
            stale_store = CogniFlowStore(db_path)
            stale_case = sample_case()
            stale_store.seed_if_empty(stale_case.notes, stale_case.tasks, stale_case.study_logs)
            stale_store.close()

            custom_case = StudentCase(
                check_in="I feel stressed because my DBMS quiz is tomorrow and normalization is weak.",
                tasks=[Task("Practice DBMS normalization forms", "DBMS", date.today() + timedelta(days=1), 5, 40)],
                notes=[Note("Custom DBMS normalization note", "2NF and 3NF examples are the priority for tomorrow's quiz.")],
                study_logs=[StudyLog(date.today() - timedelta(days=1), "DBMS", "Normalization", 40, "3NF still feels weak.")],
            )

            output = io.StringIO()
            with redirect_stdout(output):
                run_demo(custom_case, custom_mode=True, db_path=db_path)

            rendered = output.getvalue()
            self.assertIn(custom_case.check_in, rendered)
            self.assertIn("Practice DBMS normalization forms", rendered)
            self.assertIn("Custom DBMS normalization note", rendered)
            self.assertNotIn("AI assignment rubric", rendered)

            store = CogniFlowStore(db_path)
            self.assertGreaterEqual(len(store.list_notes()), len(stale_case.notes) + 1)
            store.close()

    def test_check_in_validation_rejects_too_short_input(self) -> None:
        self.assertFalse(is_valid_check_in("1"))
        self.assertTrue(is_valid_check_in("I feel stressed because my DBMS quiz is tomorrow."))

    def test_reset_demo_database_clears_existing_rows(self) -> None:
        case = sample_case()
        with tempfile.TemporaryDirectory() as tempdir:
            db_path = Path(tempdir) / "demo.db"
            store = CogniFlowStore(db_path)
            store.seed_if_empty(case.notes, case.tasks, case.study_logs)
            store.close()

            reset_demo_database(db_path)

            store = CogniFlowStore(db_path)
            self.assertEqual(store.list_notes(), [])
            self.assertEqual(store.list_tasks(), [])
            self.assertEqual(store.list_study_logs(), [])
            store.close()

    def test_dbms_active_task_ranks_dbms_note_above_ai_note(self) -> None:
        today = date.today()
        case = StudentCase(
            check_in="I feel stressed because my DBMS quiz is tomorrow and normalization is weak.",
            tasks=[Task("Revise DBMS normalization", "DBMS", today + timedelta(days=1), 5, 30)],
            notes=[
                Note("Unrelated AI note", "NLP guardrails and human-in-the-loop rubric details for the AI assignment."),
                Note("DBMS normalization note", "Normalization functional dependency 2NF 3NF and transaction isolation quiz revision."),
            ],
            study_logs=[StudyLog(today - timedelta(days=1), "DBMS", "Normalization", 30, "3NF is still weak and needs practice again.")],
        )

        result = CogniFlowProPipeline().run(case)
        self.assertTrue(result.retrieved_notes)
        self.assertEqual(result.retrieved_notes[0].note.title, "DBMS normalization note")

    def test_larger_synthetic_classifier(self) -> None:
        cases = synthetic_training_cases()
        classifier = CognitiveStateClassifier()
        classifier.train(cases)
        metrics = evaluate_classifier(classifier, cases)
        self.assertGreaterEqual(metrics["num_cases"], 18)
        self.assertGreaterEqual(metrics["accuracy"], 0.5)


if __name__ == "__main__":
    unittest.main()

