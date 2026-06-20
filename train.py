"""Train and evaluate the CogniFlow cognitive-state classifier."""

from __future__ import annotations

from cogniflow.data import synthetic_training_cases
from cogniflow.ml import CognitiveStateClassifier, evaluate_classifier


def main() -> None:
    cases = synthetic_training_cases()
    classifier = CognitiveStateClassifier()
    classifier.train(cases)
    metrics = evaluate_classifier(classifier, cases)

    print("CogniFlow Cognitive State Classifier")
    print("=" * 40)
    print(f"Synthetic disclosed training cases: {metrics['num_cases']}")
    print(f"Training-set accuracy: {metrics['accuracy']:.2f}")
    print("\nConfusion matrix:")
    for actual, row in metrics["confusion_matrix"].items():
        print(f"- actual={actual}: {row}")
    print("\nNote: this is a small synthetic hackathon dataset, not a validated clinical model.")


if __name__ == "__main__":
    main()

