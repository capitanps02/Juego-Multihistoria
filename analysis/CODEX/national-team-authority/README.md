# National-team authority handoff

Shared workstream for issue #162.

- `ARCHITECTURE_CONTRACT.md` defines the facts the current runtime can prove and the fail-closed boundary.
- `implementation-ready.json` is the machine-readable Codex queue.
- runtime projection: `src/simulation/national-team-authority.ts`.
- directed QA: `scripts/test-t5-national-team-authority.mjs`.

This workstream does not own canonical event rewrites, `contentIdentity`, event fingerprints or migration registration.
