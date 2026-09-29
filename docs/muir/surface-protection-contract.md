# MUIR P1 — Formal surface protection contract

Base: P0 certified SHA `c5b6d0d6d18802a62d174bf450c95ebf1d0403c0`.

This contract converts the P0 surface map into enforceable P1 design authority.

## PROTECTED — must survive P1 and later visual implementation

| CONTRACT_ID | Protected quality | Enforcement |
|---|---|---|
| MUIR-PROT-DARK-001 | Dark/cinematic depth is the base identity | No global light conversion; surfaces remain dark hierarchy. |
| MUIR-PROT-BLUE-001 | Blue is primary interaction/focus emphasis | Primary actions, active states and focus remain blue-family. |
| MUIR-PROT-GOLD-001 | Gold is scarce prestige/career emphasis | Do not turn gold into generic CTA color. |
| MUIR-PROT-GEO-001 | Broad rounded geometry | Token normalization may reduce values, not square the interface. |
| MUIR-PROT-NARR-001 | Narrative weight over spreadsheet density | Cards/data must not turn primary screens into dense dashboards. |
| MUIR-PROT-SHARED-001 | One shared UI authority | Web, PlayCanvas and Android must consume the same shared presentation authority. |
| MUIR-PROT-DATA-001 | PlayerView/public contracts define what may be shown | Mockups/docs cannot authorize absent fields. |
| MUIR-PROT-A11Y-001 | Existing focus/reduced-motion semantics cannot regress | Any later implementation must preserve/improve P0 evidence. |

## ADAPTABLE — may change when evidence and rollback are documented

| CONTRACT_ID | Adaptable area | Constraint |
|---|---|---|
| MUIR-ADAPT-GLASS-001 | Glass/blur strength | Requires performance/accessibility comparison; VDR-GLASS-001 for system decision. |
| MUIR-ADAPT-HERO-001 | Hero height/composition | No public information loss; VDR-HERO-001. |
| MUIR-ADAPT-PANEL-001 | Generic panel/card styling | Must map to semantic component variants. |
| MUIR-ADAPT-TOP-001 | Topbar presentation | Navigation/actions/data remain equivalent. |
| MUIR-ADAPT-NAV-001 | Side/bottom navigation treatment | Destination count/visibility needs VDR-NAV-001 and VDR-IMMERSIVE-001. |
| MUIR-ADAPT-DENS-001 | Information density/spacing | Must improve scanability without removing essential public data. |
| MUIR-ADAPT-TYPE-001 | Type scale | Must improve readability; no smaller critical mobile text. |
| MUIR-ADAPT-ORDER-001 | Ordering of already-public fields | No new fields, effects, probabilities or authority. |
| MUIR-ADAPT-TUTORIAL-001 | Tutorial placement | Function remains discoverable; repeated presentation may be reduced later. |

## REPLACEABLE — presentation may be replaced when equivalent function remains

| CONTRACT_ID | Replaceable element | Constraint |
|---|---|---|
| MUIR-REPL-TUTORIAL-001 | Permanently repeated tutorial presentation | Do not remove help without an equivalent discoverable route. |
| MUIR-REPL-ICON-001 | Generic iconography | Replacement must follow P1 icon contract; no mixed packs/emoji. |
| MUIR-REPL-COPY-001 | Redundant decorative copy | Narrative identity and operational clarity must not regress. |
| MUIR-REPL-IMAGE-001 | Presentation-only imagery | May change only when it carries no state/action authority. |

## NEVER VISUAL AUTHORITY

P1 and subsequent UI implementation may not alter or infer:

- GameSession command semantics;
- PlayerView/public data authority;
- RNG or simulation behavior;
- market/contracts/selection;
- narrative outcomes or choice IDs;
- save schema;
- Football Database authority;
- Player Actions authority;
- hidden/private facts;
- absent name/GRL/attributes/standings/tactics/cloud/predictions.

## Conflict rule

If a mockup, visual guide or proposed component conflicts with runtime/public contracts, runtime/public contracts win. The visual artifact must be adapted or rejected.

## Rollback rule

Every later normalization/implementation change must be revertible independently. A visual improvement is invalid if rollback requires changing gameplay, persistence or public data contracts.
