# MUIR P4 — Microcopy / onboarding / contextual help gate

**P4_GATE: PASS**

This file is part of the exact-head certification candidate. The PASS claim is valid only when the `MUIR P4 Microcopy` workflow completes SUCCESS on the same commit SHA.

## Authority

- P3 certified predecessor: `3bb551e0701626d909cd42ffaa35b74e41d159b5`
- Branch: `ui-a2/muir-p4-microcopy`
- Gameplay changes: **NONE**
- New gameplay features: **NONE**

## Copy evidence

- Reproducible inventory: `analysis/muir/p4/microcopy-inventory.json`
- Reviewed inventory: `analysis/muir/p4/microcopy-inventory.md`
- Reduction metrics: `analysis/muir/p4/reduction-metrics.json`
- Inventory occurrences: **283**
- Frozen KEEP occurrences: **263**
- Controlled change occurrences: **20**
- Operational characters: **561 → 366 (−34.8%)**
- Operational words: **91 → 61 (−33.0%)**
- Protected narrative reduced: **0**

## Help / accessibility

- Permanent Home help changed to native `details/summary`.
- Help remains discoverable as “Cómo se juega”.
- Duplicated Home stat glossary removed; canonical stat help remains accessible in “Tu momento”.
- Required certification: 360×800, 390×844, 412×915; AXE; keyboard/focus contract; 100%, 130%, 180% text.

## Semantic protection

The executable P4 guard requires byte-identical P3 function blocks for:

- `mainAction`;
- `renderDecision`;
- `renderOffer`;
- `importFile`;
- `confirmReplace`.

It also explicitly guards delegation semantics, loan wording, destructive save/import context and Player Actions optionality.

## Final exact-head conditions

P4 is certified only if the exact-head workflow passes:

1. build;
2. P4 semantic/scope/optionality guard;
3. deterministic viewport matrix;
4. P4 contextual help + AXE + text-scale probe;
5. P3 Home regression;
6. P3 Home accessibility regression;
7. P2 shell regression;
8. shared package graph;
9. PlayCanvas;
10. Android offline package + regression;
11. final P4 static gate;
12. evidence upload.
