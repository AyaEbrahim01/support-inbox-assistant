import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

TICKETS_FILE = BASE_DIR / "data" / "tickets.json"
LABELS_FILE = BASE_DIR / "data" / "labels.json"


def load_tickets():
    with open(TICKETS_FILE, "r", encoding="utf-8") as file:
        tickets = json.load(file)

    return tickets


def load_labels():
    with open(LABELS_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    return {
        label["id"]: {
            "category": label["category"],
            "priority": label["priority"],
        }
        for label in data["labels"]
    }