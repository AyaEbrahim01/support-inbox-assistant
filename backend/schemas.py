from pydantic import BaseModel , Field
from typing import Literal
class TriageResult(BaseModel):
        category: Literal[
        "billing",
        "bug",
        "feature_request",
        "account",
        "security",
        "other"
    ]
        priority: Literal[
        "low",
        "medium",
        "high",
        "urgent"
    ]
        summary: str
        suggested_reply: str
        confidence: float = Field(ge=0.0, le=1.0)
        escalate: bool
test = TriageResult(
    category="billing",
    priority="high",
    summary="Customer was charged twice.",
    suggested_reply="We will review the duplicate charge.",
    confidence=0.95,
    escalate=False
)

print(test)

# bad_test = TriageResult(
# category="billing",
# priority="high",
# summary="Customer was charged twice.",
# suggested_reply="We will review the duplicate charge.",
# confidence=1.5,
# escalate=False
# )

# print(bad_test)