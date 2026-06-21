# Carbon Compute Enterprise

## About

Carbon Compute Enterprise is a hybrid, enterprise-deployable carbon accounting system built around two planes:

1. A host service that runs inside the enterprise AI / infrastructure boundary.
2. An admin dashboard for sustainability, platform, finance, and audit teams.

The scaffold is designed for high-integrity accounting, not just estimation. It includes:

- A deterministic carbon calculation engine.
- A tamper-evident audit ledger with hash chaining and optional signing.
- A policy boundary for LLM-assisted workflows.
- Connectors and data normalizers for cloud, Kubernetes, VM, facility, LLM, and manual inputs.
- A dashboard that can review computations, evidence, and provenance.

## Core principles

- Use measured data when available, estimated data only when necessary.
- Keep every compute step explainable and replayable.
- Treat audit evidence as append-only.
- Separate calculation logic from presentation and from LLM orchestration.

## Repo layout

- `apps/host` - the enterprise host service and API.
- `apps/dashboard` - the admin dashboard UI.
- `docs` - architecture, threat model, and operating model.
- `infra` - deployment examples for containers and Kubernetes.

## Run

Start the host with:

```bash
npm run start:host
```

The host serves the API and the dashboard UI on the same origin by default.

## What is in the scaffold

The scaffold already contains the major control surfaces an enterprise team would need:

- Emissions factors and unit normalization.
- Scope 1, 2, and 3 style rollups.
- LLM usage accounting hooks.
- Evidence ingestion and ledger verification.
- A dashboard for operations and audit review.

The next step after this scaffold is usually to wire real enterprise integrations, identity, and emission-factor governance.
