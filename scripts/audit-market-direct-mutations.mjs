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
  if (p === 'src/simulation/offers.ts') return 'valid_authority';
  if (p === 'src/content/initial-state.ts') return 'initialization';
  if (p.includes('migration') || p.includes('/migrations/')) return 'migration';
  if (withinProposalStaging(node)) return 'proposal_staging';
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
const report = { schemaVersion: 1, scannedRoot: 'src', summary, findings };
console.log(JSON.stringify(report, null, 2));

const unsafe = findings.filter(x => x.classification === 'unsafe_runtime');
if (unsafe.length) {
  console.error(`\nFound ${unsafe.length} unclassified/unsafe runtime market-contract mutations.`);
  process.exitCode = 1;
}
