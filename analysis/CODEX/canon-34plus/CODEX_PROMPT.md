# Codex prompt — ordinary Canon 34+

Repo: `capitanps02/Juego-Multihistoria`  
Base: latest `main`  
Branch: `t51/canon-34plus`  
No auto-merge.

Implement only ordinary late-career 34+ canon. Terminal retirement/last-match closure/epilogues belong to Agent 9 / PR #118.

Read first:
1. `analysis/CODEX/canon-34plus/CANON_STATUS.json`
2. `analysis/CODEX/canon-34plus/implementation-ready.json`
3. `analysis/CODEX/canon-34plus/VETERAN_LATE_STATE.md`
4. `analysis/CODEX/canon-34plus/RETIREMENT_HANDOFF.md`
5. canonical source `analysis/2026-09-11/guion-extraido.txt`.

Priority lots:
A canonical-missing ordinary scenes; B needs-reimplementation; C market/contracts; D sport/injury/selection; E legacy/family/media/NPC; F pre-retirement pressure only.

Hard rules:
- Use `CareerOffer`/offer bridge for contract or club decisions.
- No direct `state.club`/contract mutation from narrative choices.
- No age-only retirement/decline.
- No synthetic match, minutes, goal, final, selection or last-match fact.
- No inferred agent/captain/family identities.
- Preserve history/provenance and pending-decision semantics.
- Do not freeze/register contentIdentity or global migrations here.
- If a required authority is unavailable, fail closed rather than use a proxy.

Required QA after each active batch: focused authority tests, save/load/pending decision, 33→34 through later supported ages, no automatic retirement, no synthetic last match/goal, `npm test`, `npm run build`, migration tests and Repository Integrity.