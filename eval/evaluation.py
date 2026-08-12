import json
from pathlib import Path

from backend.data import load_labels


BASE_DIR = Path(__file__).resolve().parent.parent

PREDICTIONS_FILE = BASE_DIR / "eval" / "current_predictions.json"
RESULTS_FILE = BASE_DIR / "eval" / "results.json"


def load_predictions():
    with open(PREDICTIONS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data["predictions"]


def evaluate():
    labels = load_labels()
    predictions = load_predictions()

    predictions_by_id = {
        prediction["id"]: prediction
        for prediction in predictions
    }

    total_labeled = len(labels)

    category_correct = 0
    priority_correct = 0

    mismatches = []

    for ticket_id, true_label in labels.items():
        pred = predictions_by_id.get(ticket_id)

        if pred is None:
            mismatches.append(
                {
                    "ticket_id": ticket_id,
                    "expected": true_label,
                    "predicted": None,
                }
            )
            continue

        category_match = (
            pred["category"] == true_label["category"]
        )

        priority_match = (
            pred["priority"] == true_label["priority"]
        )

        if category_match:
            category_correct += 1

        if priority_match:
            priority_correct += 1

        if not (category_match and priority_match):
            mismatches.append(
                {
                    "ticket_id": ticket_id,
                    "expected": true_label,
                    "predicted": pred,
                }
            )

    category_accuracy = category_correct / total_labeled
    priority_agreement = priority_correct / total_labeled

    results = {
        "metrics": {
            "category_accuracy": category_accuracy,
            "priority_agreement": priority_agreement,
        },
        "predictions": predictions,
    }

    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"Evaluated tickets: {total_labeled}")
    print(f"Total predictions: {len(predictions)}")
    print(f"Category accuracy: {category_accuracy:.2%}")
    print(f"Priority agreement: {priority_agreement:.2%}")

    print(f"\nResults saved to: {RESULTS_FILE}")

    if mismatches:
        print("\nDetailed mismatches:")

        for mismatch in mismatches:
            print("\nMismatch:")
            print(json.dumps(mismatch, indent=2))


if __name__ == "__main__":
    evaluate()