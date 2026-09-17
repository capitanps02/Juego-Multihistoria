import { CONDITIONAL_CANON_MATRIX } from "./conditional-canon-matrix.mjs";

const sharedDependency = new Set(["CEVT_19_SOCIAL_01","CEVT_22_FREE_01"]);
const terminal = new Set(["CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED","CEVT_38_MEDIA_FAREWELL","CEVT_38_FAMILY_REVERSAL","CEVT_RET_RECONSIDER","CEVT_RET_STORYBOOK_LAST_GOAL","CEVT_RET_NO_LAST_MATCH"]);

export const CONDITIONAL_OWNERSHIP = {
  schemaVersion: 1,
  generatedAt: "2026-09-17",
  branch: "t51/canon-conditionals",
  records: CONDITIONAL_CANON_MATRIX.records.map(record => ({
    id: record.id,
    phase: record.phase,
    owner: terminal.has(record.id) ? "Agent 14 / t5/retirement-epilogues" : "t51/canon-conditionals",
    branch: terminal.has(record.id) ? "t5/retirement-epilogues" : "t51/canon-conditionals",
    status: terminal.has(record.id) ? "terminal_owner" : record.implementationStatus === "blocked" ? "blocked" : sharedDependency.has(record.id) ? "shared_dependency" : "available"
  }))
};

export default CONDITIONAL_OWNERSHIP;