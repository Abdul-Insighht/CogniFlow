import unittest

from cogniflow.data import sample_case, synthetic_training_cases
from cogniflow.memory import MemoryEngine
from cogniflow.ml import CognitiveStateClassifier, evaluate_classifier
from cogniflow.pipeline import CogniFlowPipeline


class CogniFlowPipelineTest(unittest.TestCase):
    def test_pipeline_returns_plan(self) -> None:
        result = CogniFlowPipeline().run(sample_case())
        self.assertIn(result.prediction.label, {"focused", "neutral", "stressed", "overwhelmed"})
        self.assertTrue(result.plan.steps)
        self.assertIn("Student must accept", result.plan.human_control)

    def test_memory_retrieves_dbms_note(self) -> None:
        case = sample_case()
        results = MemoryEngine(case.notes).search("normalization database quiz")
        self.assertTrue(results)
        self.assertEqual(results[0].note.title, "DBMS weak topics")

    def test_classifier_evaluates_synthetic_cases(self) -> None:
        cases = synthetic_training_cases()
        classifier = CognitiveStateClassifier()
        classifier.train(cases)
        metrics = evaluate_classifier(classifier, cases)
        self.assertEqual(metrics["num_cases"], len(cases))
        self.assertGreaterEqual(metrics["accuracy"], 0.5)


if __name__ == "__main__":
    unittest.main()

