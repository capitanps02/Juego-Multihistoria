# MUIR P1 — Icon contract

Authority: current inline SVG family in `web/game-ui.js`.

P1 defines the contract only. Actual replacement/refinement belongs to the later implementation pass (P10 or other authorized visual implementation), not P1.

## Family

Use one coherent outline family:

- SVG `viewBox="0 0 24 24"`;
- default rendered size: 20 × 20 px;
- existing compact mobile nav may render at 19 × 19 px;
- `fill: none`;
- `stroke: currentColor`;
- stroke width: 1.6;
- round line caps and joins.

Do not mix filled glyphs, emoji, platform-native symbols and unrelated icon packs in the same navigation/system language.

## Alignment

- Icon and label align to the same interaction box.
- Icons do not create separate click targets when paired with a label.
- Navigation icons remain visually centered above/beside their label according to responsive layout.
- Optical alignment may use local layout spacing; SVG geometry itself should remain on the common 24-unit grid.

## Accent use

- default icon color inherits text;
- active navigation/focus may use primary blue;
- prestige gold only when the icon itself represents a prestige/milestone concept;
- danger/positive icons only when the semantic state is actually danger/positive.

Icons never become the sole carrier of favorable/unfavorable/disabled state.

## Icon + label

Required for:
- primary navigation;
- unfamiliar actions;
- destructive/recovery operations;
- any control whose meaning would be ambiguous as icon-only.

## Icon-only

Allowed only when:
- the symbol is conventional in context;
- the control has an explicit accessible name through `aria-label` or equivalent;
- touch target meets the accessibility contract;
- state is not communicated by icon shape alone.

## Prohibited

- emoji as functional icons;
- decorative emoji inside system/status copy;
- mixing multiple external icon packs without a documented migration;
- icons that imply unavailable features (cloud, standings, tactics, market, editable avatar);
- badges/counters without public data authority.

## Replacement rule

If later implementation replaces current SVG paths:
1. replace by semantic icon ID, not ad-hoc per screen;
2. preserve accessible labels;
3. preserve/measure touch target;
4. compare scanability and continuity through the P1 A/B rubric;
5. retain rollback to current inline SVG family.
