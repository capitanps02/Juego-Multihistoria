# MUIR P3 — Home vertical y core loop

**P3_GATE: PASS**, subject to executable exact-head verification by `scripts/test-muir-p3-final-gate.mjs`.

Authorized predecessor: `315a46d87ffc15f688910f4dbc91651d935c9e7f`  
P2 certified authority: `c41f58f6839ae14f2857f47026eacdfe4e189a3c`

## Scope

P3 changes only the shared Home presentation and its reproducible certification harness.

Product implementation:
- dynamic protagonist identity from `PlayerView.player.displayName`;
- compact vertical Home hero;
- position, age and current club from public PlayerView;
- primary core-loop action promoted for mobile;
- decision / offer / result pending states receive priority;
- summary remains a non-pending continuation state;
- Player Actions stays optional and visually secondary;
- Forma / Estado físico / Fatiga use existing public values;
- `latestMatch` is reused when present;
- no fabricated future match, GRL, stars, morale, club objectives or hidden attributes.

## Authority / equivalence

P3 does not change:
- `GameSession`;
- `SessionCommand`;
- snapshots or persistence;
- RNG;
- simulation;
- football database;
- market/contracts;
- narrative authority;
- Player Actions authority.

The exact-head scope guard compares `mainAction()` and `run()` with the authorized predecessor and rejects out-of-scope files.

## Required Home states

Certification covers real deterministic runtime states:
- IDLE;
- DECISION;
- OFFER;
- RESULT;
- SUMMARY;
- LONG NAME after a real identity edit.

## Responsive / interaction matrix

Required:
- 360x800;
- 390x844;
- 412x915;
- 844x390 landscape;
- 768x1024 tablet;
- no horizontal overflow;
- primary Home action at least 48 px;
- optional Player Actions action at least 48 px;
- pending CTA before bottom navigation;
- long identity remains inside the hero.

## Accessibility

Required:
- P2 shell keyboard / focus / aria-current regression stays green;
- Home primary and optional secondary actions remain native keyboard-focusable buttons;
- no serious/critical WCAG 2.0/2.1 A/AA AXE findings on Home;
- 130% text-only stress produces no horizontal overflow;
- player identity remains inside the hero under 130% text.

## Platform parity

The same shared `web/game-ui.js` + `web/game-ui.css` authority must pass:
- shared package graph;
- PlayCanvas package regression;
- Android offline clean build;
- Android offline regression.

## Implementation evidence

Run `36555903464` on `bea84d673588ab89d2e160d6140980fb462b0231` passed all product/platform checks:
- scope + command equivalence;
- deterministic 69-capture matrix;
- IDLE / DECISION / OFFER / RESULT / SUMMARY / LONG NAME Home probe;
- Home AXE + 130% text;
- P2 shell regression;
- package graph;
- PlayCanvas package;
- Android offline clean package;
- Android offline regression.

That run's only failure was inside the final gate changed-file parser, which had serialized its newline regex with doubled backslashes and therefore treated the full allowed file list as one path.

## PASS rule

**P3_GATE: PASS**, subject to executable exact-head verification. The exact HEAD containing this PASS record must complete the full `MUIR P3 Home` workflow successfully, including `Final executable P3 gate`.
