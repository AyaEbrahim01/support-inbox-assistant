import json
from pathlib import Path

from backend.data import load_tickets
from backend.llm import triage_ticket

BASE_DIR = Path(__file__).resolve().parent.parent
PREDICTIONS_FILE = BASE_DIR / "eval" / "current_predictions.json"

def run_pipeline():
    tickets = load_tickets()

    predictions = []

    for ticket in tickets:
        print(f"Processing {ticket['id']}...")

        result = triage_ticket(ticket)

        predictions.append({
            "id": ticket["id"],
            **result.model_dump()
        })

    return predictions


if __name__ == "__main__":
    predictions = run_pipeline()

    with open(PREDICTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(
            {"predictions": predictions},
            f,
            indent=2,
            ensure_ascii=False
        )

    print(f"Processed {len(predictions)} tickets.")
    print(f"Predictions saved to: {PREDICTIONS_FILE}")