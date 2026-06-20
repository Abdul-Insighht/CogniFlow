"""Train and evaluate the upgraded CogniFlow Pro classifier."""

from __future__ import annotations

from cogniflow_pro.ml import CognitiveStateClassifier, evaluate_classifier
from cogniflow_pro.sample_data import synthetic_training_cases


def main() -> None:
    cases = synthetic_training_cases()
    classifier = CognitiveStateClassifier()
    classifier.train(cases)
    metrics = evaluate_classifier(classifier, cases)

    print("CogniFlow Pro Cognitive State Classifier")
    print("=" * 48)
    print(f"Synthetic disclosed training cases: {metrics['num_cases']}")
    print(f"Training-set accuracy: {metrics['accuracy']:.2f}")
    print("\nConfusion matrix:")
    for actual, row in metrics["confusion_matrix"].items():
        print(f"- actual={actual}: {row}")
    print("\nResponsible AI note: this is a synthetic demo classifier, not a clinical model.")


if __name__ == "__main__":
    main()

