# Threat Model

## Goals

- Preserve integrity of carbon calculations.
- Keep evidence append-only.
- Prevent unauthorized modification of emission factors or ledger history.
- Make LLM actions observable and bounded.

## Primary threats

- Tampering with historical audit entries.
- Silent replacement of emission factors.
- Over-permissioned LLM tool calls.
- Input poisoning through manual uploads.
- Data-source spoofing from connectors.

## Controls

- Hash chaining for all ledger entries.
- Signed entries when a signing key is configured.
- Explicit source metadata for every record.
- Read/write separation between dashboard and host logic.
- Tool allowlists and role-based restrictions.
- Verification endpoints for ledger integrity checks.
