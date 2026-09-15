import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';

const trace = JSON.parse(fs.readFileSync('analysis/2026-09-11/t1/principal-traceability.json', 'utf8'));
const principals = EVENTS.filter(event => event.family !== 'conditional');
const conditionals = EVENTS.filter(event => event.family === 'conditional');

function normalizeTitle(value) {
  return value
    .replace(/^\d+(?:\.\d+)*\.?\s*/u, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim();
}

const unresolved = trace.scenes
  .filter(scene => scene.mappingStatus === 'unresolved')
  .map(scene => {
    const title = normalizeTitle(scene.title);
    const candidates = principals
      .filter(event => normalizeTitle(event.text.title) === title)
      .map(event => ({ id: event.id, title: event.text.title, phase: event.phase }));
    return {
      canonicalId: scene.canonicalId,
      sourceTitle: scene.title,
      phase: scene.phase,
      status: candidates.length === 1 ? 'title_candidate_needs_semantic_review' : candidates.length > 1 ? 'title_candidate_ambiguous' : 'unresolved_no_title_match',
      candidates
    };
  });

const report = {
  task: 'T5.1',
  generatedAt: new Date().toISOString(),
  source: {
    traceability: 'analysis/2026-09-11/t1/principal-traceability.json',
    sourceDocSha256: trace.sourceDocSha256
  },
  counts: {
    canonicalPrincipals: trace.canonicalPrincipalCount,
    literalIdMatches: trace.literalMatches,
    unresolvedPrincipalIds: unresolved.length,
    enginePrincipals: principals.length,
    engineConditionals: conditionals.length
  },
  conditionalReconciliation: {
    status: 'count_only_not_semantically_reconciled',
    sourceInventory: 'No hay inventario canónico de IDs condicionales en la auditoría actual.',
    engineCount: conditionals.length
  },
  aliases: [],
  noSilentAliases: true,
  unresolved
};

fs.writeFileSync('analysis/2026-09-15/T5.1-reconciliation.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  ...report.counts,
  titleCandidates: unresolved.filter(row => row.candidates.length > 0).length,
  ambiguousTitleCandidates: unresolved.filter(row => row.status === 'title_candidate_ambiguous').length,
  aliases: report.aliases.length,
  noSilentAliases: report.noSilentAliases
}, null, 2));
