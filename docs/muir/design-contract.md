# MUIR P1 — Design contract and semantic token system

Base authority: P0 certified SHA `c5b6d0d6d18802a62d174bf450c95ebf1d0403c0`.

Status: P1 pass 2. This document defines semantics only. It does not redesign Home/Carrera/Mundo/Perfil/Player Actions, does not change navigation, and does not modify gameplay or public data.

## 1. Authority order

When sources disagree, use this order:

1. runtime behavior and GameSession;
2. public PlayerView/contracts;
3. P0 certified baseline/evidence;
4. MUIR-RTM;
5. this design contract;
6. validated visual guide;
7. mockups.

A mockup never creates data or behavior.

## 2. Token philosophy

MUIR tokens are names for **existing product values**, not a replacement framework. P1 intentionally avoids Bootstrap/Material/Tailwind-style scales that are not grounded in Multihistoria.

The reference token file is `docs/muir/tokens.css`. It is documentation-only in P1 and is not imported by production.

## 3. Spacing contract

Proposed canonical spacing values, all already present in production:

| Token | Value | Typical semantic use |
|---|---:|---|
| space-1 | 6 px | tight internal separation |
| space-2 | 8 px | compact control/group gap |
| space-3 | 10 px | small card/control spacing |
| space-4 | 12 px | default compact gap |
| space-5 | 14 px | default row/card gap |
| space-6 | 16 px | content block separation |
| space-7 | 20 px | panel internal grouping |
| space-8 | 24 px | major surface padding |

Existing 5/7/9/11/13/15/18 px values are not banned; they become exceptions requiring a component reason rather than system defaults.

## 4. Radius contract

| Token | Value | Intended role |
|---|---:|---|
| radius-small | 10 px | media/detail corners |
| radius-control | 14 px | buttons, choices, action options |
| radius-medium | 18 px | alerts/compact modal sub-surfaces |
| radius-panel | 24 px | primary cards/panels |
| radius-immersive | 27 px | hero/navigation/immersive shell |
| radius-pill | 999 px | milestone/status chip only |
| radius-circle | 50% | avatars only |

The current 8/9/12/13/16/19/20/25 px radii are candidates for semantic normalization in implementation passes. P1 itself does not replace them.

## 5. Typography roles

| Role | Proposed token | Derived current use | Contract |
|---|---|---|---|
| display | clamp(28px,3.1vw,45px), 1.08 | global h1 | Narrative screen identity. |
| title | 26px, 1.18 | next-card title | Major card/section title, not every panel. |
| heading | 18px | h3 / strong section headings | Subsection hierarchy. |
| body | 14px / 1.65 | default paragraphs | Standard readable copy. |
| body-small | 13px | rows/buttons/context | Compact operational copy. |
| label | 12px | rows/chapter/control labels | Functional metadata. |
| caption | 10px | eyebrow/supporting labels | Minimum semantic caption target. |

Current 8–9 px navigation text is **not** promoted to a semantic token. It remains measured debt for later navigation implementation/VDR.

## 6. Surface semantics

| Surface token | Current value | Meaning |
|---|---|---|
| background | `#09090b` | application base |
| surface-1 | `#141416` | recessed/base panel endpoint |
| surface-2 | `#202023` | primary panel endpoint |
| elevated | `#17171be8` | busy/floating status |
| overlay | `#111114e8` | cinematic decision sheet |
| glass | `#1a1a1d89` | translucent shell/topbar family |

Surface semantics describe hierarchy, not screen ownership. A screen may use several surfaces.

## 7. Accent semantics

- **primary** — blue; interaction, active state, focus.
- **prestige** — gold; milestones, brand/career prestige, selective veteran/retirement emphasis.
- **positive** — green; favorable result text.
- **progress** — green progress meter only.
- **warning** — warm gold/amber text/background family for attention without error.
- **danger** — red; error/unfavorable state.
- **neutral** — muted system copy.

Prestige and warning may share a warm family but may not share purpose. Gold must not become a generic primary CTA color.

## 8. Elevation semantics

| Level | Current shadow | Use |
|---|---|---|
| none | none | base surfaces |
| low | `0 7px 22px #0a84ff26` | primary interactive emphasis |
| medium | `0 15px 50px #0008` | alerts/floating feedback |
| high | `0 24px 120px #000a` | blocking dialogs |
| immersive | `0 20px 70px #0005` | cinematic decision sheet |

Blur is not elevation. Blur values remain separate and are governed by VDR-GLASS-001.

## 9. State contract

### Focus
Keep existing 3 px `#409cff` outline + 7 px blue halo + 5 px offset unless later evidence proves a better accessible equivalent.

### Disabled
Disabled states must remain visibly non-interactive and preserve readable reason copy where the public contract provides it. Opacity alone is insufficient when a reason exists.

### Error
Errors use danger semantics and must expose text/role semantics; never rely only on red.

### Empty
Empty states explain absence using public facts. They must not invent future standings, offers or hidden progression.

### Loading/busy
Busy state must identify the operation and block duplicate commands without fabricating progress percentages.

### Reduced motion
`prefers-reduced-motion: reduce` remains a protected behavior.

## 10. Normalization decisions

Every later normalization must record the six fields below.

| ID | ACTUAL | PROPOSED | COMPONENTS | REASON | RISK | ROLLBACK |
|---|---|---|---|---|---|---|
| NORM-RADIUS-001 | 8/9/10/12 px small radii | radius-small 10 px where optical role is equivalent | media, small details, keycaps | reduce accidental variance | some controls may lose optical fit | restore component-local radius |
| NORM-RADIUS-002 | 13/14 px control radii | radius-control 14 px | nav/button/choice/action option | common control geometry | nav compactness may change | retain 13 px nav exception |
| NORM-RADIUS-003 | 24/25 px large panel radii | radius-panel 24 px when semantics match | panels/dialog/topbar candidates | remove 1 px drift | shell/topbar may need optical 25 | preserve topbar exception |
| NORM-BLUE-001 | 409cff / 0a84ff / gradient values | semantic primary/focus/gradient roles | focus, active nav, CTA, choices | retain family while clarifying purpose | over-normalization could flatten hierarchy | keep component-specific derived token |
| NORM-OVERLAY-001 | many white alpha stops | border-subtle/control + documented exceptions | panels, controls, dividers | improve consistency | contrast regressions | restore exact alpha per component |
| NORM-SPACE-001 | 5–20 px granular gaps | 6/8/10/12/14/16/20/24 canonical set | global layout primitives | reduce drift | dense mobile areas may need 5/7/9 | retain justified local exception |
| NORM-TYPE-001 | 8–52 px unnamed sizes | seven semantic roles | all UI | readability/consistency | nav may need layout change to reach caption 10 | do not force token until nav VDR |
| NORM-GLASS-001 | blur 20/26/30 + backdrop 8 | low/medium/high/backdrop semantic names | glass controls/topbar/nav/dialog backdrop | make perf tradeoff measurable | naming could falsely imply required hierarchy | VDR-GLASS-001 can reject mapping |

## 11. Prohibited token use

Tokens may not be used to justify:

- new public fields;
- new screens;
- removal of required actions;
- new navigation destinations;
- hidden-state presentation;
- new gameplay or persistence behavior.

## 12. P1 pass-2 scope evidence

This pass creates `docs/muir/tokens.css` and this contract only. Production `web/game-ui.css` and `web/game-ui.js` remain unchanged from P0 certified authority.
