# Sport authority delta after main@5f4d14b

Main now persists an authoritative weekly league-fixture model and exposes it through `facts.sport` / `facts.match`.

## Now authoritative

- registration club as the sporting club;
- current season and league tier;
- deterministic weekly league calendar (Aug-May);
- next scheduled league fixture and hours to it;
- current and previous persisted official league fixture;
- home/away and opponent for those produced fixtures;
- current-match squad status: not called / bench / substitute / starter;
- called-up, on-bench, started, appeared and minutes facts;
- injury-unavailable fact for the concrete produced fixture;
- first squad call, bench, appearance, start and full-match milestones once the match store exists;
- a concrete debut substitution decision context when the producer actually generated it;
- remaining league fixtures and league-objective open/closed state.

These are simulation-owned facts and do not consume narrative RNG.

## Still unavailable

- match result;
- goals, assists and cards;
- penalty/set-piece occurrence or hierarchy;
- league standing;
- continental/European competitions;
- cup/final/semifinal identity;
- national-team fixtures or tournament matches;
- concurrent fixtures every ~3 days / multi-competition congestion;
- tactical instruction/proposal from the coach;
- named opponent/player-specific roster facts beyond the generic simulated opponent.

## Canon consequences

The previous generic blocker "no fixture authority" is narrowed, not deleted.

- `EVT_24_MATCH_001`: still blocked because canon requires an actual penalty-hierarchy moment; a league fixture alone cannot manufacture a penalty.
- `EVT_26_MED_001`: still blocked because canon requires a high-density calendar; the current producer is one league fixture per seven-day football cycle and does not prove three-day congestion.
- `EVT_26_MATCH_001`: re-audit only if its exact canonical contract can be satisfied without goals/records/results. Do not infer any scoring fact from form or reputation.
- `EVT_26_EUR_001`, `EVT_26_FINAL_001`, `EVT_27_EUR_001` and final/semifinal callbacks: still blocked because the producer currently supports `competition: league` only and `result` remains unavailable.
- fan/stadium-reaction scenes remain blocked: a home fixture does not prove boos, applause or crowd division.

## Rule for Codex

A new sport-gated implementation must name the exact `facts.sport` or `facts.match` field that proves every asserted sporting fact. If a fact would need `result`, `goals`, a non-league competition, a penalty, a final label, standings or a tactical instruction, stop and hand it back as `blocked_shared_authority`.
