# Security Operating Model

## Enterprise boundary

The host should be deployed where the enterprise already trusts compute, secrets, identity, and logs.

## Minimum controls

- SSO or workload identity for dashboard access.
- Secrets in a managed secret store.
- WORM or immutable storage for exports where possible.
- Periodic ledger verification.
- Change control for emission factors and methodology updates.
