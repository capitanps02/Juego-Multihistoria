# MUIR P12 — dynamic media visual classification

Status: REVIEWED_TEST_NONDETERMINISM

Scope: only the deterministic regression harness for the P9 `decision-video` state.

Observed on exact P12 candidate `4757adac4acdd886dd5971622cb8ab39bb1000dd`:
- exact-P11 replay screenshot SHA-256: `c608c10411007e7461be2aa1f7c5200c0802f880556450f28e990d781ae4a520`
- P12 screenshot SHA-256: `93b4c36e17b446643c9dc01b645a37d07b7afd9673cbf37e0775aaf973d84252`
- prior P12 rerun of the same unchanged product: `0153ee8829c930c46090e32c7f959bc06cdebb68b0860dbedbcd8333914c3e63`

All three hashes differ, demonstrating that the native video frame is timing-dependent.

The current and exact-P11 P9 evidence agree on the semantic/geometry contract:
- state = playing
- dialogOpen = false
- playerKind = event
- posterHidden = true
- videoHidden = false
- enabled button height = 48 px
- decisionChoices = 4
- serious accessibility findings = 0
- horizontal overflow findings = 0

P11 -> P12 product scope guard reports zero product/runtime files changed.

Final rule:
- byte-identical screenshots remain `UNCHANGED`;
- only `p9-cinematics / decision-video` may become `UNCHANGED_DYNAMIC_MEDIA`;
- that classification is allowed only when the complete recorded semantic/geometry metric is byte-equivalent between exact P11 and P12 and both states are `playing`;
- any other differing screenshot remains `NEEDS_REVIEW`;
- no golden is updated or replaced.

This preserves G12's requirement that every one of the 314 captures is individually classified without treating a native video frame timestamp as a UI regression.
