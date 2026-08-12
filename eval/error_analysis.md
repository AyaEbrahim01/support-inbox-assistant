# Error Analysis

## Evaluation Summary

The current version was evaluated on the 16 tickets that have ground-truth labels, while the pipeline generated predictions for all 30 tickets.

- Category accuracy: **75.00%**
- Priority agreement: **43.75%**

The results show that category classification is stronger than priority classification. The main weakness is priority calibration, while some category errors occur between semantically overlapping categories.

## Where the System Fails

### 1. Priority classification

Priority is the main weakness of the current version.

The model frequently predicts `medium` or `high` when the expected priority is different. Examples include:

- **T-001:** expected `high`, predicted `medium`
- **T-003:** expected `low`, predicted `medium`
- **T-005:** expected `high`, predicted `medium`
- **T-007:** expected `medium`, predicted `low`
- **T-013:** expected `low`, predicted `medium`
- **T-017:** expected `medium`, predicted `low`
- **T-019:** expected `urgent`, predicted `high`
- **T-021:** expected `high`, predicted `low`

This suggests that the model can often recognize the underlying issue but has difficulty consistently calibrating business urgency.

### 2. Category confusion

Category classification is stronger overall, but several errors occur between categories with overlapping semantics.

Examples include:

- **T-006:** expected `bug`, predicted `security`
- **T-009:** expected `billing`, predicted `account`
- **T-019:** expected `bug`, predicted `security`
- **T-021:** expected `account`, predicted `security`

The model appears to over-classify some API, privacy, or data-related issues as `security`, even when the ground-truth category is different.

### 3. Ambiguous and adversarial inputs

Some tickets are intentionally difficult or low quality.

For example, **T-008** contains an instruction such as "Ignore all previous instructions." This should be treated as customer-provided ticket content rather than as an instruction to the triage system.

This is an important reliability and safety concern because the system is intended to assist a human reviewer rather than automatically execute instructions contained in customer messages.

## Why These Errors Occur

The system relies on a small local LLM (`llama3.2:3b`), which provides a useful lightweight baseline but has limited reasoning and classification consistency compared with larger models.

The priority problem is particularly difficult because priority depends on business impact and urgency rather than only on the type of issue. The same category can contain both low- and high-priority tickets.

Category errors are also expected when a ticket contains multiple signals. For example, a ticket can mention account access and billing in the same message, making the boundary between categories less obvious.

Finally, adversarial or low-quality inputs can cause smaller models to follow instructions contained inside the ticket instead of treating the ticket strictly as untrusted input.

## What I Would Do Next

### 1. Improve priority reasoning

Add clearer priority criteria to the prompt based on impact and urgency, for example:

- `urgent`: active production outage, critical security incident, or severe widespread impact
- `high`: significant functionality blocked or important business impact
- `medium`: normal product issue requiring support attention
- `low`: informational requests, minor issues, or non-blocking requests

This should be combined with examples rather than relying only on category definitions.

### 2. Improve category boundaries

Provide explicit decision rules for overlapping categories, especially:

- `security` vs `bug`
- `account` vs `billing`
- `account` vs `feature_request`

The goal would be to make the model prioritize the customer's primary request rather than individual keywords.

### 3. Treat ticket content as untrusted input

The system should explicitly instruct the LLM that ticket text is data, not instructions. This reduces the risk of prompt injection from adversarial customer messages.

### 4. Consider a deterministic post-processing layer

For highly reliable signals, a lightweight rule-based layer could be added after the LLM. However, this should be introduced carefully and evaluated on held-out data to avoid overfitting the labeled subset.

### 5. Expand the evaluation set

Only 16 of the 30 tickets currently have ground-truth labels. Adding labels for the remaining tickets would provide a more representative evaluation and make it easier to determine whether improvements generalize beyond the current labeled subset.

## Overall Assessment

The current version provides a functional baseline for automated first-pass triage, with stronger category classification than priority classification.

The evaluation also demonstrates why the system should remain human-in-the-loop rather than automatically sending responses.

The next improvements should focus on priority calibration, clearer category boundaries, and safer handling of untrusted ticket content rather than optimizing only for the current labeled examples.