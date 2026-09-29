# VDR-IMMERSIVE-001 — Immersive navigation

Status: ACCEPTED  
Owner: UI-A6 / P9  
Baseline SHA: `ecc72b9abebbc64533c86b1f3cf7009a127c0c02`  
Decision-certified SHA: `8308794aa5734a2b06c5b952925aba07c5cc9f68`  
Evidence workflow: `36623464538` — SUCCESS

## Question

Should the main bottom navigation remain visible during Decision / Result / Offer / cinematic presentation?

## Accepted decision — MIXED

- **Mobile immersive (<=820 px): bottom navigation hidden.**
- **Wider / landscape immersive: navigation remains available but visually secondary.**
- Every immersive Decision / Result / Offer surface retains explicit safe **Volver a Inicio** presentation exit.
- Browser/Android-style Back closes the immersive presentation only.
- Back never dispatches `choose`, `acknowledge` or `offer`.
- Result Continue remains explicit and is never mapped to Back.
- Decision/Offer exit never answers the pending state.

## Evidence

The accepted behavior was tested at:
- 360×800
- 390×844
- 412×915
- 844×390 landscape
- text scale 100 %, 130 %, 180 %

P9.2 browser evidence confirmed:
- 2 / 3 / 4 choices remain usable;
- safe exit touch targets >=48 px;
- no horizontal overflow;
- AXE serious/critical = 0;
- keyboard choice navigation remains functional;
- Back closes immersive presentation with zero `choose` / `acknowledge` commands.

P9.3 and P9.4 subsequently reused the same VDR and passed Result and Offer browser matrices without changing the navigation decision.

## Rejected alternatives

### Always visible

Rejected on mobile because it consumes the bottom shell row during the highest-density narrative states and increases accidental navigation surface.

### Always hidden

Rejected for wider/landscape layouts because it removes useful navigation without a measured space benefit and is more restrictive than required.

## Rollback

Restore the P8 navigation behavior and remove the P9 immersive mobile override if:
- Back ever resolves a pending state;
- safe exit becomes unavailable;
- focus return regresses;
- Android back certification fails in P9.6.
