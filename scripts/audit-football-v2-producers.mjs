import fs from 'node:fs';

const producerFiles = [
  'src/simulation/match-model.ts',
  'src/simulation/early-career-market.ts',
  'src/simulation/world-simulator-core.ts',
  'src/simulation/offers.ts',
  'src/simulation/professional-adapter.ts',
  'src/catalog/football/fixture-opponent.ts',
  'src/catalog/football/market-destination.ts',
  'src/catalog/football/narrative-club-alias.ts'
];

const forbidden = [
  { label: 'SIM_OPP producer', re: /SIM_OPP_/ },
  { label: 'Development producer', re: /Development_/ },
  { label: 'Domestic producer', re: /Domestic_/ },
  { label: 'Summer producer', re: /Summer_/ },
  { label: 'Loan producer', re: /Loan_/ },
  { label: 'Aurora CF producer', re: /Aurora CF/ },
  { label: 'formatted Club N · M producer', re: /Club\s+(?:\$\{|\d+)\s*·\s*(?:\$\{|\d+)/ }
];

const legacyForeignReaderAllowlist = new Map([
  ['src/simulation/world-simulator-core.ts', [
    /return\s+\/\^Foreign_\/i\.test\(clubId\)/
  ]],
  ['src/catalog/football/fixture-opponent.ts', [
    /foreign\s*=.*\/\^Foreign_\/i\.test\(registrationClub\)/
  ]]
]);

const violations = [];
for (const file of producerFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const rule of forbidden) {
      if (rule.re.test(line)) violations.push({ file, line: index + 1, rule: rule.label, text: line.trim() });
    }
    if (/Foreign_/.test(line)) {
      const allowed = (legacyForeignReaderAllowlist.get(file) ?? []).some(re => re.test(line));
      if (!allowed) violations.push({ file, line: index + 1, rule: 'Foreign producer/unapproved reader', text: line.trim() });
    }
  }
}

if (violations.length) {
  console.error(JSON.stringify({ ok: false, violations }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  producerFiles: producerFiles.length,
  certifiedLegacyReaders: 2,
  syntheticProducerViolations: 0
}, null, 2));
