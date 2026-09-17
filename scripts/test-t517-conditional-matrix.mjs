import test from "node:test";
import assert from "node:assert/strict";
import { CONDITIONAL_CANON_FIELDS, CONDITIONAL_CANON_MATRIX } from "../analysis/T5.1/conditional-canon-matrix.mjs";
import { CONDITIONAL_OWNERSHIP } from "../analysis/T5.1/conditional-ownership.mjs";

const allowed = new Set(["verified_same_identity","needs_reimplementation","canonical_missing","engine_only_noncanonical","canonical_replacement","blocked","terminal_owned_elsewhere"]);

test("T5.17 conditional matrix covers the reconciled universe with explicit statuses", () => {
  const records = CONDITIONAL_CANON_MATRIX.records;
  assert.equal(CONDITIONAL_CANON_MATRIX.activeRuntimeCount, 134);
  assert.equal(CONDITIONAL_CANON_MATRIX.reconciliationUniverseCount, 168);
  assert.equal(records.length, 168);
  assert.equal(new Set(records.map(r => r.id)).size, 168);
  for (const record of records) {
    for (const field of CONDITIONAL_CANON_FIELDS) assert.ok(Object.hasOwn(record, field), `${record.id} missing ${field}`);
    assert.ok(allowed.has(record.implementationStatus), `${record.id} invalid status`);
  }
  assert.deepEqual(CONDITIONAL_CANON_MATRIX.statusSummary, {blocked:52,canonical_missing:34,engine_only_noncanonical:34,needs_reimplementation:37,terminal_owned_elsewhere:6,verified_same_identity:5});
});

test("T5.17 ownership manifest has one disposition per reconciled identity", () => {
  assert.equal(CONDITIONAL_OWNERSHIP.records.length, 168);
  assert.equal(new Set(CONDITIONAL_OWNERSHIP.records.map(r => r.id)).size, 168);
  const terminal = CONDITIONAL_OWNERSHIP.records.filter(r => r.status === "terminal_owner").map(r => r.id).sort();
  assert.deepEqual(terminal, ["CEVT_38_FAMILY_REVERSAL","CEVT_38_MEDIA_FAREWELL","CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED","CEVT_RET_NO_LAST_MATCH","CEVT_RET_RECONSIDER","CEVT_RET_STORYBOOK_LAST_GOAL"]);
});

test("T5.17 known collision/blocker dispositions stay explicit", () => {
  const byId = new Map(CONDITIONAL_CANON_MATRIX.records.map(r => [r.id, r]));
  for (const id of ["CEVT_21_ABR_01","CEVT_21_MEDIA_01","CEVT_22_FREE_01","CEVT_29_BODY_04"]) assert.equal(byId.get(id)?.implementationStatus, "needs_reimplementation");
  for (const id of ["CEVT_30_BODY_01","CEVT_34_MAJOR_COMEBACK"]) assert.equal(byId.get(id)?.implementationStatus, "blocked");
});