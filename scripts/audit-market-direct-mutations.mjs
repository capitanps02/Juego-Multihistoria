import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = path.resolve('src');
const TARGET_PROPERTIES = new Set([
  'club',
  'monthsRemaining',
  'salaryMonthly',
  'releaseClause',
  'ownerClub',
  'registrationClub'
]);
const TARGET_PATHS = [
  'club',
  'contract.monthsRemaining',
  'contract.salaryMonthly',
  'contract.releaseClause',
  'professional.ownerClub',
  'professional.registrationClub',
  'world.ownerClub'
];
// Baseline captured on the PR #163 integration line. Debt is allowed to shrink as
// content owners migrate scenes to CareerOffer bridges, but it must never grow.
const DEBT_CEILINGS = Object.freeze({
  legacy_debt: 46,
  legacy_runtime_bridge: 3
});

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && full.endsWith('.ts') ? [full] : [];
  });
}

function rel(file) {
  return path.relative(process.cwd(), file).replaceAll('\\', '/');
}

function propertyName(node) {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression)) return node.argumentExpression.text;
  return null;
}

function enclosingFunctionName(node) {
  let current = node;
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name) return current.name.text;
    if ((ts.isFunctionExpression(current) || ts.isArrowFunction(current)) && current.parent && ts.isVariableDeclaration(current.parent) && ts.isIdentifier(current.parent.name)) {
      return current.parent.name.text;
    }
    current = current.parent;
  }
  return null;
}

function withinProposalStaging(node) {
  let current = node;
  while (current) {
    if (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) {
      const call = current.parent;
      if (call && ts.isCallExpression(call) && call.arguments.includes(current)) {
        const callee = call.expression.getText();
        if (callee === 'proposeCareerChange' || callee.endsWith('.proposeCareerChange')) return true;
      }
    }
    current = current.parent;
  }
  return false;
}

function classify(file, node) {
  const p = rel(file);
  const fn = enclosingFunctionName(node);
  if (p === 'src/simulation/offers.ts') return 'valid_authority';
  if (p === 'src/content/initial-state.ts') return 'initialization';
  if (p.includes('migration') || p.includes('/migrations/')) return 'migration';
  if (withinProposalStaging(node)) return 'proposal_staging';
  // Age-20 adaptation is a transactional proposal builder: adaptState20ToProfessional
  // snapshots CareerTerms, calls adaptProfessionalContext, restores `before` with
  // applyTerms(), then materialises the proposed terms through CareerOffer.
  if (p === 'src/simulation/professional-adapter.ts' && fn === 'adaptProfessionalContext') return 'transition_proposal_builder';
  // Contract time erosion belongs to calendar authority. PR #156 relocates the
  // established simulator body byte-for-byte into world-simulator-core.ts while the
  // public wrapper remains world-simulator.ts, so both paths represent the same owned
  // monthlyContractTick authority. Reaching zero is *not* free agency; #130 owns the
  // still-blocked employment-resolution transition.
  if (
    (p === 'src/simulation/world-simulator.ts' || p === 'src/simulation/world-simulator-core.ts')
    && fn === 'monthlyContractTick'
  ) return 'calendar_contract_tick';
  // resolveChoiceCore currently repairs owner/registration after legacy event effects
  // mutate club. This is compatibility debt, not a permitted signing authority, and
  // must disappear as those scenes are converted to CareerOffer bridges.
  if (p === 'src/narrative/resolver.ts' && fn === 'resolveChoiceCore') return 'legacy_runtime_bridge';
  if (p.startsWith('src/content/events/')) return 'legacy_debt';
  return 'unsafe_runtime';
}

function statementText(node, source) {
  let current = node;
  while (current.parent && !ts.isStatement(current)) current = current.parent;
  return current.getText(source).replace(/\s+/g, ' ').trim().slice(0, 300);
}

const findings = [];
for (const file of walk(ROOT)) {
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const visit = node => {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
      const prop = propertyName(node.left);
      if (prop && TARGET_PROPERTIES.has(prop)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        findings.push({
          file: rel(file),
          line: line + 1,
          target: node.left.getText(source),
          property: prop,
          classification: classify(file, node),
          statement: statementText(node, source)
        });
      }
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && ['set', 'n'].includes(node.expression.text)) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg) && TARGET_PATHS.includes(arg.text)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        findings.push({
          file: rel(file),
          line: line + 1,
          target: arg.text,
          property: arg.text.split('.').at(-1),
          classification: classify(file, node),
          statement: statementText(node, source)
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.target.localeCompare(b.target));
const summary = Object.fromEntries([...new Set(findings.map(x => x.classification))].sort().map(k => [k, findings.filter(x => x.classification === k).length]));
const report = { schemaVersion: 1, scannedRoot: 'src', debtCeilings: DEBT_CEILINGS, summary, findings };
console.log(JSON.stringify(report, null, 2));

let failed = false;
const unsafe = findings.filter(x => x.classification === 'unsafe_runtime');
if (unsafe.length) {
  console.error(`\nFound ${unsafe.length} unclassified/unsafe runtime market-contract mutations.`);
  failed = true;
}
for (const [classification, ceiling] of Object.entries(DEBT_CEILINGS)) {
  const count = summary[classification] ?? 0;
  if (count > ceiling) {
    console.error(`\n${classification} grew from ceiling ${ceiling} to ${count}. Convert new mutations to CareerOffer authority instead of expanding debt.`);
    failed = true;
  }
}
if (failed) process.exitCode = 1;
