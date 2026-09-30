# MUIR P12 — manual physical/external evidence

Do not create `analysis/muir/p12/manual-device-evidence.json` until the checks were actually executed.

The final gate accepts it only when it is tied to the exact P12 HEAD and a concrete Android build hash.

Required shape:

```json
{
  "sha": "<exact P12 HEAD>",
  "buildHash": "<tested Android build hash>",
  "device": {
    "model": "<physical device>",
    "androidVersion": "<version>",
    "resolution": "<resolution>",
    "navModes": ["gesture", "3-button"]
  },
  "talkBack": "PASS",
  "gestureNavigation": "PASS",
  "threeButtonNavigation": "PASS",
  "physicalCutout": "PASS",
  "nativePickerRoundtrip": "PASS",
  "androidSummary": "PASS",
  "androidOffer": "PASS",
  "androidCinematicFallback": "PASS",
  "androidEpilogue": "PASS",
  "remotePlayCanvasScene2593315": "PASS",
  "evidence": ["<logs/screenshots/run IDs>"],
  "approval": {"owner":"<human owner>","date":"<date>"}
}
```

Browser/emulator evidence must never be relabelled as physical TalkBack, cutout, navigation-mode or native-picker evidence.


## Exact-head workflow

Manual evidence must **not** be committed after testing because that would change the SHA it is meant to certify.

After executing the physical/external checks:
1. Open the **MUIR P12 Final Certification** workflow.
2. Use **Run workflow** on the exact final branch/SHA.
3. Paste the evidence object in the `manual_evidence_json` input.
4. The workflow overwrites its `sha` field at runtime with `GITHUB_SHA`.
5. The final aggregator accepts it only when build hash, device metadata, evidence references and approval metadata are present.

This keeps the product and certification HEAD unchanged while allowing G5/G13/G15 to close with real external evidence.
