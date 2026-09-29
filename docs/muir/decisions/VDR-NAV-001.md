# VDR-NAV-001 — Five vs six primary destinations

**VDR_ID:** VDR-NAV-001  
**TITLE:** Five vs six primary navigation destinations  
**STATUS:** ACCEPTED  
**DATE:** 2026-09-29  
**BASE_SHA:** c5b6d0d6d18802a62d174bf450c95ebf1d0403c0  
**SURFACE:** global navigation

## PROBLEM

Current product has six real destinations: Inicio, Carrera, Mundo, Relaciones, Perfil, Tu partida. P0 showed mobile labels at 9 px and 8 px at the narrowest breakpoint. A five-destination concept could reduce density, but removing one direct destination risks discoverability and one-hand ergonomics.

## BASELINE

Six destinations are public and functional. `Tu partida` contains save/import/new-story actions and must remain directly reachable. P2 raises mobile navigation labels to 10 px and keeps touch targets at 53 px in portrait and 48 px in compact landscape.

## OPTIONS

- **A — Six destinations:** preserve current information architecture; improve spacing/type/icon treatment only.
- **B — Five visible destinations:** hide the duplicate bottom-nav `Tu partida` entry and retain access through the persistent topbar control.

No option creates a new destination or removes save/recovery access.

## METRICS

Evidence: MUIR P2 shell run #31 / `36541438067`, implementation head `1a4d18ae9d784c0573ab40e2617764dec5c21ec3`, artifact `muir-p2-1a4d18ae9d784c0573ab40e2617764dec5c21ec3`.

| Criterion | A — six | B — five | Finding |
|---|---|---|---|
| Continuity | Preserves all six established destinations | Moves `Tu partida` out of primary nav | A preserves the existing information architecture |
| Next-step clarity | Exact visible label `Tu partida` | Topbar label includes date + `Partida` | A is the clearer direct destination label |
| Football-game feel | No regression | No regression | Neutral |
| Vertical density | Same shell height | Same shell height | No meaningful gain |
| Scanability | 10 px labels, 0 overflow | 10 px labels, 0 overflow | Both pass |
| One-hand ergonomics | Save center 39–41 px from bottom | Save center 761.5–874.5 px from bottom | B introduces +722.5 / +766.5 / +833.5 px reach-distance regression |
| Youthful, not infantilized | Same icon/type language | Same icon/type language | Neutral |
| Visual consistency | One six-destination primary nav | Five primary + save in topbar | A is more structurally consistent |
| Narrative weight | No change | No change | Neutral |
| Accessibility/performance | 53 px targets, 10 px labels, 0 overflow, focusable | Same target/type/overflow/focusability | Both pass |

Width gained by B is limited to +11.203 px at 360, +12.203 px at 390 and +12.797 px at 412 per visible tab. A already satisfies the P1 caption floor and touch-target requirements without horizontal overflow.

## DECISION

Accept **Option A — preserve six direct primary destinations**.

P2 does not remove, merge or hide Inicio, Carrera, Mundo, Relaciones, Perfil or Tu partida.

## JUSTIFICATION

The five-destination candidate produces a modest tab-width gain but does not improve overflow, touch height or label size because the six-destination candidate already passes those constraints. It materially worsens one-hand reach for `Tu partida` by moving the only visible save destination from the bottom navigation to the topbar.

Keeping six destinations therefore preserves continuity, direct discoverability and one-hand ergonomics without paying a measurable layout penalty.

## RISKS

Six labels remain dense on the narrowest viewport. The accepted P2 mitigation is 10 px labels, 53 px portrait targets, 48 px compact-landscape targets and no horizontal overflow. If a later redesign changes information architecture, this VDR must be superseded with new evidence.

## A11Y

P2 evidence confirms:
- 10 px mobile nav labels;
- 53 px portrait / 48 px compact-landscape nav targets;
- visible 3 px focus outline with halo;
- `aria-current="page"` follows keyboard activation;
- six focusable destinations;
- zero serious/critical AXE violations in 360/390/412 shell audits.

## PERFORMANCE

No new navigation layer, menu, state or runtime branch is introduced. P2 browser evidence records zero horizontal-overflow findings. The decision changes no gameplay or simulation code.

## PLATFORM

The same navigation and shell authority remains shared across Web, PlayCanvas and Android offline. Run #31 passed shared package graph, PlayCanvas package, Android offline clean package, Android safe-area parity smoke and Android offline tests.

## ROLLBACK

Revert P2 shell CSS to the P1-certified geometry. No route or navigation logic needs rollback because `web/game-ui.js` remains unchanged.

## EVIDENCE

- P2 shell run #31: `36541438067` — SUCCESS.
- Evidence artifact: `muir-p2-1a4d18ae9d784c0573ab40e2617764dec5c21ec3` (13.7 MB).
- `analysis/muir/p2/evidence/nav-ab.json`
- `analysis/muir/p2/evidence/safe-area.json`
- `analysis/muir/p2/evidence/topbar.json`
- `analysis/muir/p2/evidence/a11y.json`
- `analysis/muir/p2/evidence/axe.json`
