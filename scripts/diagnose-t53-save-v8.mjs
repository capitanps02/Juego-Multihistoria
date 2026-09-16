import fs from 'node:fs';
import crypto from 'node:crypto';
import { loadSave } from '../dist/save/save.js';

const source = 'examples/save-v08-seed-424242.json';
const raw = fs.readFileSync(source, 'utf8');
const parsed = JSON.parse(raw);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const normalizedRaw = JSON.stringify(parsed);
const loaded = loadSave(raw);
const normalizedLoaded = JSON.stringify(loaded);
console.log(JSON.stringify({
  source,
  rawBytes: Buffer.byteLength(raw),
  parsedHash: hash(normalizedRaw),
  loadSaveHash: hash(normalizedLoaded),
  sameSerialization: normalizedRaw === normalizedLoaded,
  sameReferenceShape: Object.keys(parsed).join(',') === Object.keys(loaded).join(',')
}, null, 2));
