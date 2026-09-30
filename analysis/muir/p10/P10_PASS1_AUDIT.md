# MUIR P10 — Pass 1 global consistency audit

Audit date: 2026-09-30  
Branch: `ui-a0-a8/muir-p10-polish-a11y`  
P9 certified predecessor: `21b7eb5fa1df25863a7018cd33eddfbab792c113`  
P8 certified predecessor recorded by P9: `ecc72b9abebbc64533c86b1f3cf7009a127c0c02`

## Precondition

- P9 branch `ui-a6/muir-p9-immersive` is identical to the certified P9 SHA.
- Exact-head workflow `MUIR P9 Immersive` run `36637412035` concluded SUCCESS.
- `docs/muir/P2_GATE.md` through `docs/muir/P9_GATE.md` are present on the certified product line and record PASS.
- P10 was branched directly from the certified P9 SHA; no merge through `main`.

## Surfaces audited

Home; Carrera; Mundo; Relaciones; Perfil; Tu partida; Player Actions; Auto-sim; Period Summary; Decision; Result; Offer; Cinematic/fallback; Epilogue; Shell; Topbar; Bottom navigation.

The audit combines direct production-source inspection with the exact certified evidence already attached to the unchanged P9 product bytes. Fresh P10 browser/AXE evidence remains required before the final P10 gate.

## Findings

### CONSISTENCY — radius

Production currently exposes 17 distinct `border-radius` values. P1 defines the canonical rectangular family as 10 / 14 / 18 / 24 / 27 px plus 999 px pill and 50% circle.

Normalization candidates:
- 25 px: topbar, world banner, dialog, decision sheet.
- 19 px: compact topbar/navigation.
- 16 px: compact shell, match/consequence/save support sub-surfaces, prologue compact state.
- 13 px: news thumb, pause status, nav button compact, glossary/retirement detail surfaces.
- 12 px: input, compact nav button, offer loan state.
- 9 px: choice key.
- 8 px: standard progress meter.
- 20/21 px: compact immersive cinema/decision/offer surfaces.

Intentional exceptions to preserve unless evidence disproves them:
- asymmetric `0 14px 14px 0` on result-choice selection geometry;
- 999 px pills;
- 50% avatars.

### CONSISTENCY — spacing

17 distinct gap values remain. P1 canonical spacing is 6 / 8 / 10 / 12 / 14 / 16 / 20 / 24 px.

High-confidence normalization candidates:
- navigation 7 -> 8;
- nav icon/label desktop 13 -> 12;
- meter 11 -> 12;
- cinema top 15 -> 16;
- wide Home grid 18 -> 20;
- compact people grid / choices 9 -> 10.

Tight 3/4/5 px gaps remain candidate exceptions where they separate micro-content rather than system-level blocks; P10 must document them rather than flatten them blindly.

### CONSISTENCY — typography

31 distinct font-size expressions are present.

Below the P1 caption floor (10 px):
- nav-foot supporting copy: 9 px;
- Home hero eyebrow: 9 px;
- save status: 9 px;
- compact brand subtitle: 9 px;
- immersive cinema eyebrow: 8 px / 9 px.

The hidden live-region `font-size:0!important` is an accessibility implementation detail and is not treated as visible typography debt.

### ICONOGRAPHY

PASS at source-family level:
- one inline SVG family;
- 24x24 viewBox;
- `fill:none`;
- `stroke:currentColor`;
- stroke width 1.6;
- round caps/joins;
- decorative paired icons use `aria-hidden=true`;
- no emoji functional icons;
- no second icon library detected.

P10 still needs a final coverage review to ensure every icon-bearing control retains a text or accessible name; text-only controls are not required to gain decorative icons.

### LOADING / ERROR / EMPTY / DISABLED

- Loading/busy: operation text is exposed through `role=status`; no fabricated progress.
- Error: global error feedback uses `role=alert` plus recovery action.
- Empty: semantic empty states use factual public copy and do not promise unavailable features.
- Disabled: Player Actions uses `cursor:not-allowed`, but global `button:disabled` uses `cursor:wait`; this conflates disabled and loading semantics and is a P10 fix candidate.

### A11Y — focus

Open findings:
1. P1 focus contract is 3 px #409cff + 7 px halo + 5 px offset.
2. Buttons/summary/input use the contract, but anchors are only given an offset and are absent from the explicit focus-visible rule.
3. `main` is keyboard-focusable (`tabIndex=0`) but production CSS removes its outline without an explicit focus-visible replacement.
4. career timeline programmatic focus uses a separate 2 px prestige-gold focus style rather than the global focus contract.

### A11Y — AXE

Inherited certified evidence on identical product bytes:
- P9 Decision/Result/Offer/Cinematic matrix: 0 serious/critical.
- P8 Mundo/Carrera/Relaciones/Perfil/Tu partida matrices: 0 serious/critical.
- P7 semantic components: 0 serious/critical.
- P6 Player Actions: dedicated AXE contract passed.
- P5 Auto-sim state matrix: 0 serious/critical.
- P3/P2 Home and shell accessibility regressions passed.

Fresh P10 AXE execution is still PENDING and is mandatory before P10 PASS.

### A11Y — keyboard

Inherited predecessor evidence is PASS for the certified product bytes. P10 fresh keyboard regression is PENDING.

Static issue to fix: hidden focus on `main` can make keyboard/programmatic navigation less visible even though command semantics are unchanged.

### A11Y — text scale

- P8 secondary surfaces were certified at 100 / 130 / 180%.
- P7 semantic components were certified at 100 / 130 / 180%.
- P6 Player Actions includes text-scale coverage.
- Home has dedicated 130% evidence.
- P9 immersive surfaces require fresh P10 cross-surface scale verification, especially Decision 4-choice, Offer and Result.

### A11Y — reduced motion

Global `prefers-reduced-motion: reduce` disables CSS animation/transition and restores auto scroll behavior. P5 reduced-motion evidence is PASS. Fresh P10 cross-surface verification remains PENDING.

### RESPONSIVE

Certified predecessor evidence covers 360x800, 390x844, 412x915, 844x390 landscape and tablet across P2-P9 scopes. Fresh P10 cross-surface verification remains PENDING after normalization changes.

### VISUAL REGRESSION

At P10 entry there are no P10 product diffs. Therefore:
- EXPECTED_P10: 0
- REGRESSION: 0
- UNREVIEWED: 0

This will be reset and reclassified after P10 normalization changes.

## Finding classes

- CONSISTENCY: radius, spacing, type hierarchy, state semantics.
- A11Y: visible focus coverage, caption floor, disabled/loading distinction, fresh AXE/text-scale/TalkBack evidence.
- ICONOGRAPHY: no incompatible pack detected; coverage review pending.
- RESPONSIVE: no entry regression; fresh post-change matrix pending.
- REGRESSION: none introduced by P10 at pass-1 entry.
- OUT_OF_SCOPE: gameplay, RNG, GameSession, PlayerView, Football DB, Player Actions rules, narrative and persistence authority.

## Pass-1 conclusion

The exact predecessor gate is satisfied. P10 is authorized and the audit identifies concrete normalization work without reopening layout or gameplay.

Pass 2 must begin with token-backed CSS normalization, focus-visible unification and disabled/loading semantic separation. Every visual delta must be classified and tested before the P10 percentage advances beyond the audit tranche.
