# MUIR P10 — Consistency matrix

Status after Pass 1 audit. PASS requires post-change executable evidence; inherited predecessor evidence is recorded as BASELINE where applicable.

| SUPERFICIE | TOKENS | TYPOGRAPHY | ICONS | FOCUS | EMPTY | ERROR | DISABLED | A11Y | RESPONSIVE | STATUS |
|---|---|---|---|---|---|---|---|---|---|---|
| Home | PENDING | PENDING | BASELINE | PENDING | BASELINE | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Carrera | PENDING | PENDING | BASELINE | PENDING | BASELINE | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Mundo | PENDING | PENDING | BASELINE | PENDING | BASELINE | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Relaciones | PENDING | PENDING | BASELINE | PENDING | BASELINE | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Perfil | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Tu partida | PENDING | PENDING | BASELINE | PENDING | BASELINE | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Player Actions | PENDING | PENDING | BASELINE | PENDING | BASELINE | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Auto-sim | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Period Summary | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Decision | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Result | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Offer | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Cinematic / fallback | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Epilogue | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Shell | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Topbar | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |
| Bottom nav | PENDING | PENDING | BASELINE | PENDING | N/A | BASELINE | PENDING | BASELINE | BASELINE | IN_PROGRESS |

## Pass-1 grouped open findings

- CONSISTENCY/RADIUS: 1 system-level proliferation finding; 30 noncanonical declarations/cascade variants audited.
- CONSISTENCY/SPACING: 1 system-level proliferation finding; 14 noncanonical gap declarations audited.
- CONSISTENCY/TYPE: 1 system-level proliferation finding; 6 visible declarations below 10 px.
- ICONOGRAPHY: 0 incompatible packs; 0 emoji functional icons.
- STATE/DISABLED: 1 semantic mismatch (`cursor:wait` global disabled).
- A11Y/FOCUS: 3 grouped findings (anchor coverage, main focus visibility, timeline focus divergence).
- A11Y/AXE: 0 inherited serious/critical on certified scoped matrices; fresh P10 run pending.
- A11Y/TALKBACK: MANUAL_REQUIRED / eligible for formal P12 deferral.
- RESPONSIVE: 0 entry regressions inherited; fresh post-change run pending.
- VISUAL REGRESSION: 0 P10 diffs at entry.
