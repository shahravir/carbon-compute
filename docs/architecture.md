# Architecture

## Overview

The system is designed around a hybrid enterprise deployment model.

### Plane 1: Host inside enterprise infrastructure

The host service runs inside the enterprise AI or platform boundary and owns:

- Ingestion and normalization of activity data.
- Deterministic carbon calculations.
- Evidence ledger append and verification.
- Policy enforcement for LLM-assisted operations.
- Export of signed or attestable reporting artifacts.

### Plane 2: Admin dashboard

The dashboard is a human control surface for:

- Sustainability review and methodology management.
- Platform and infrastructure data quality checks.
- Finance and procurement review of allocations.
- Auditors verifying traceability and ledger integrity.

## Trust model

The design uses three layers of trust control:

1. Hash-chained audit entries.
2. Optional HMAC signing of ledger entries.
3. Replayable calculation logic with explicit emission factors.

## Data flow

1. Source systems emit activity data.
2. The host normalizes and validates the data.
3. The carbon engine computes emissions and confidence.
4. The ledger records the raw evidence and the derived result.
5. The dashboard reads the ledger and calculation outputs.

## LLM boundary

LLM usage is treated as an orchestrated helper, not an authority.

The host should:

- Redact secrets before sending prompts to models.
- Restrict tool-call permissions.
- Keep deterministic compute outside the model.
- Log each model-assisted action to the audit ledger.
