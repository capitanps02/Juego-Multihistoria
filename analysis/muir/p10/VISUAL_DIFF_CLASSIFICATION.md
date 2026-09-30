# MUIR P10 — Visual diff classification plan

Baseline: exact certified P9 SHA `21b7eb5fa1df25863a7018cd33eddfbab792c113`.

## Expected P10 deltas

The following pixel changes are EXPECTED_P10 only when they match the documented normalization and introduce no clipping/overflow:

- 25 -> 24 px panel/topbar/world/dialog radius;
- compact shell radii -> 18 px;
- compact nav controls -> 14 px;
- immersive compact sheets -> 18 px;
- desktop Decision sheet -> 27 px;
- progress end caps -> pill radius;
- 7/9/11/13/15/18 px high-confidence spacing drift -> nearest P1 semantic spacing;
- visible 8/9 px captions -> 10 px;
- primary CTA blue gradient darkened for AA contrast;
- small muted copy raised to #8b8b90;
- consistent focus halo on anchor/main/timeline;
- SVG DOM obtains `.muir-icon`, data-icon and focusable=false without path/geometry changes.

## Automatic REGRESSION classification

Any screenshot/browser probe showing one of the following is REGRESSION, not EXPECTED_P10:

- horizontal overflow;
- clipped CTA or choice;
- hidden critical action;
- text overlap;
- safe-area collision;
- bottom-nav collision;
- missing label;
- focus ring clipped beyond usable bounds;
- broken 2/3/4-choice Decision layout;
- Offer actions losing visibility;
- Player Actions target/option disappearance;
- save/import controls cut off;
- cinematic fallback blocked;
- changed gameplay/result/public data.

## PREEXISTING

Only findings demonstrably present on certified P9 and unchanged by P10 may be PREEXISTING.

## NEEDS_REVIEW

Any remaining pixel diff not explained by the expected list above is NEEDS_REVIEW and prevents P10 final certification until classified.

## Current counts

At this document commit:
- EXPECTED_P10: implementation categories defined; screenshot count pending workflow
- REGRESSION: 0 known
- PREEXISTING: 0 newly classified
- NEEDS_REVIEW: all fresh screenshot deltas pending execution/review

No golden/baseline update is authorized merely to remove a failing diff.
