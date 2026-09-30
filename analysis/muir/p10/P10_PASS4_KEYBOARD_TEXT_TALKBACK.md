# MUIR P10 — Pass 4 keyboard / focus / text scale / TalkBack

Status: IMPLEMENTED HARNESS, executable closure pending exact-head workflow.

## Keyboard / focus

Fresh P10 workflow reruns:
- P2 shell keyboard/focus probe;
- P3 Home accessibility probe;
- P6 Player Actions focus/keyboard paths;
- P9 Decision/Offer keyboard and Back behavior.

P10-specific source normalization additionally requires:
- shared focus-visible contract for button, summary, input, anchor and focusable main;
- timeline programmatic focus uses the same focus-visible contract;
- no outline removal without replacement.

## Text scale coverage

Critical surfaces required by P10:

| Surface | 100% | 130% | Extreme 180% | Evidence |
|---|---|---|---|---|
| Home | PENDING fresh | PENDING fresh | PENDING fresh | P10 critical text-scale probe |
| Player Actions | PENDING fresh | PENDING fresh | PENDING fresh | P6 browser probe rerun in P10 |
| Offer | PENDING fresh | PENDING fresh | PENDING fresh | P9 offer probe rerun in P10 |
| Decision 4 choices | PENDING fresh | PENDING fresh | PENDING fresh | P9 decision probe rerun in P10 |
| Result | PENDING fresh | PENDING fresh | PENDING fresh | P9 result probe rerun in P10 |
| Tu partida | PENDING fresh | PENDING fresh | PENDING fresh | P8 save probe rerun in P10 |
| Auto-sim | PENDING fresh | PENDING fresh | PENDING fresh | P10 critical text-scale probe |

The P10-specific probe uses the real deterministic fixture harness at 390x844 and rejects:
- horizontal overflow;
- disappearance of required state/action text;
- hidden enabled actions;
- critical action targets below 48 px;
- missing reduced-motion media state.

## TalkBack

Status: MANUAL_REQUIRED.

No browser/AXE result is relabeled as TalkBack evidence.

If a physical/emulated Android TalkBack pass is not executable inside P10, final P10 reporting must use:
- TALKBACK: DEFERRED_TO_P12
- owner: UI-A7 / P12 final certification
- impact: P10 cannot claim a physical screen-reader PASS
- retained evidence: semantic HTML/ARIA + keyboard + AXE + Android offline package regression

This deferral does not authorize false PASS; it records the remaining manual certification step explicitly.
