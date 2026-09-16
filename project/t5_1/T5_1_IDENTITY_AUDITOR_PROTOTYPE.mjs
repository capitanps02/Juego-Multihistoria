#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}
function die(msg, code=1) { console.error(msg); process.exit(code); }

const canonicalPath = arg('--canonical');
const runtimeCsvPath = arg('--runtime-csv');
const outputPath = arg('--output');
if (!canonicalPath || !runtimeCsvPath) {
  die('Usage: node T5_1_IDENTITY_AUDITOR_PROTOTYPE.mjs --canonical manifest.json --runtime-csv runtime.csv [--output report.json]');
}

const canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
if (!Array.isArray(canonical.events)) die('canonical manifest must expose events[]');

// Small RFC4180-enough parser for the P1 matrix / generated audit CSVs.
function parseCsv(text) {
  const rows=[]; let row=[], field='', quoted=false;
  for (let i=0;i<text.length;i++) {
    const ch=text[i];
    if (quoted) {
      if (ch==='"' && text[i+1]==='"') { field+='"'; i++; }
      else if (ch==='"') quoted=false;
      else field+=ch;
    } else {
      if (ch==='"') quoted=true;
      else if (ch===',') { row.push(field); field=''; }
      else if (ch==='\n') { row.push(field.replace(/\r$/,'')); rows.push(row); row=[]; field=''; }
      else field+=ch;
    }
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/,'')); rows.push(row); }
  const header=rows.shift(); if (header?.[0]) header[0]=header[0].replace(/^\uFEFF/,'');
  return rows.filter(r=>r.some(v=>v!=='')).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]??''])));
}

const runtimeRows = parseCsv(fs.readFileSync(runtimeCsvPath,'utf8'));
if (!runtimeRows.length || !('code_id' in runtimeRows[0])) die('runtime CSV must contain code_id');

const canonEvents = canonical.events.map(e=>({id:e.canonicalId, kind:e.kind, phase:e.phase}));
const runtimeEvents = runtimeRows.map(r=>({id:r.code_id, kind:r.kind, phase:r.phase}));

function duplicates(items) {
  const c=new Map();
  for (const x of items) c.set(x.id,(c.get(x.id)||0)+1);
  return [...c].filter(([,n])=>n>1).map(([id,count])=>({id,count}));
}
function setDiff(a,b) {
  const bs=new Set(b.map(x=>x.id));
  return a.filter(x=>!bs.has(x.id));
}
function stats(kind) {
  const c=canonEvents.filter(x=>x.kind===kind);
  const r=runtimeEvents.filter(x=>x.kind===kind);
  const cset=new Set(c.map(x=>x.id));
  const exact=r.filter(x=>cset.has(x.id));
  const missing=setDiff(c,r);
  const extra=setDiff(r,c);
  return {
    canonicalCount:c.length,
    runtimeCount:r.length,
    exactIdCount:exact.length,
    missingCount:missing.length,
    extraCount:extra.length,
    missingIds:missing.map(x=>x.id).sort(),
    extraIds:extra.map(x=>x.id).sort()
  };
}

const report={
  canonicalSource:path.basename(canonicalPath),
  runtimeSource:path.basename(runtimeCsvPath),
  total:{
    canonicalCount:canonEvents.length,
    runtimeCount:runtimeEvents.length,
    canonicalDuplicates:duplicates(canonEvents),
    runtimeDuplicates:duplicates(runtimeEvents)
  },
  principal:stats('principal'),
  conditional:stats('conditional')
};
report.total.exactIdCount=report.principal.exactIdCount+report.conditional.exactIdCount;
report.total.missingCount=report.principal.missingCount+report.conditional.missingCount;
report.total.extraCount=report.principal.extraCount+report.conditional.extraCount;
report.pass = report.total.canonicalCount===388 &&
              report.total.runtimeCount===388 &&
              report.total.canonicalDuplicates.length===0 &&
              report.total.runtimeDuplicates.length===0 &&
              report.total.missingCount===0 && report.total.extraCount===0;

const rendered=JSON.stringify(report,null,2)+'\n';
if (outputPath) fs.writeFileSync(outputPath, rendered);
process.stdout.write(rendered);
process.exit(report.pass ? 0 : 2);
