import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P9='21b7eb5fa1df25863a7018cd33eddfbab792c113';
const read=p=>fs.readFileSync(p,'utf8');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();

assert.equal(git('merge-base',P9,'HEAD'),P9,'P10 must descend from exact certified P9');

const changed=git('diff','--name-only',P9+'..HEAD').split('\n').filter(Boolean);
const forbidden=changed.filter(p=>p.startsWith('src/')||p==='web/indexed-save-store.js'||p.startsWith('data/football/'));
assert.deepEqual(forbidden,[],'P10 must not change gameplay, persistence or Football DB authority');

const css=read('web/game-ui.css');
const js=read('web/game-ui.js');
const p9js=git('show',P9+':web/game-ui.js');

for(const token of [
  '--muir-space-1:6px','--muir-space-8:24px',
  '--muir-radius-small:10px','--muir-radius-control:14px',
  '--muir-radius-medium:18px','--muir-radius-panel:24px',
  '--muir-radius-immersive:27px','--muir-radius-pill:999px',
  '--muir-type-caption:10px','--muir-focus-outline:3px solid #409cff',
  '--muir-focus-offset:5px','--muir-motion-control:180ms'
]) assert.ok(css.includes(token),'missing P1 production token '+token);

assert.ok(!/cursor\s*:\s*wait/.test(css),'disabled controls must not globally look like loading');
assert.ok(css.includes('button:disabled{cursor:not-allowed;opacity:.55}'),'disabled semantics must be explicit');
assert.ok(css.includes('a:focus-visible'),'anchors need the same focus-visible contract');
assert.ok(css.includes('main:focus-visible'),'focusable main needs visible focus');
assert.ok(css.includes('.timeline [data-journal-index]:focus-visible'),'timeline focus must use focus-visible');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'),'reduced-motion contract must remain present');

const visibleTiny=[];
for(const m of css.matchAll(/font-size\s*:\s*([0-9.]+)px/g)){
  const n=Number(m[1]);
  if(n>0&&n<10) visibleTiny.push(n);
}
assert.deepEqual(visibleTiny,[],'visible typography must not fall below the 10px caption floor');

for(const n of [8,9,12,13,16,19,20,21,25]){
  assert.ok(!new RegExp('border-radius\\s*:\\s*'+n+'px').test(css),'unowned radius '+n+'px remains');
}
for(const n of [7,9,11,13,15,18]){
  assert.ok(!new RegExp('(?:^|[;{])gap\\s*:\\s*'+n+'px','m').test(css),'high-confidence spacing drift '+n+'px remains');
}

assert.ok(!/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(js),'functional/system UI must not introduce emoji icons');
assert.ok(js.includes("s.classList.add('muir-icon')"),'icons must share the MUIR icon family marker');
assert.ok(js.includes("s.setAttribute('viewBox','0 0 24 24')"),'icon family must stay on 24x24 grid');
assert.ok(js.includes("s.setAttribute('aria-hidden','true')"),'paired decorative icons must stay hidden from AT');
assert.ok(js.includes("s.setAttribute('focusable','false')"),'paired icons must not create focus stops');
assert.ok(js.includes("stroke-width:1.6")||css.includes('stroke-width:1.6'),'icon stroke width must remain coherent');

const oldIcon="function icon(name){const s=doc.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');const p=doc.createElementNS(s.namespaceURI,'path');p.setAttribute('d',svgPaths[name]||svgPaths.arrow);s.append(p);return s;}";
const newIcon="function icon(name){const key=svgPaths[name]?name:'arrow';const s=doc.createElementNS('http://www.w3.org/2000/svg','svg');s.classList.add('muir-icon');s.dataset.icon=key;s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('focusable','false');const p=doc.createElementNS(s.namespaceURI,'path');p.setAttribute('d',svgPaths[key]);s.append(p);return s;}";
assert.ok(p9js.includes(oldIcon),'certified P9 icon baseline unexpectedly changed');
assert.equal(js,p9js.replace(oldIcon,newIcon),'P10 may not rewrite narrative or behavior in game-ui.js outside icon semantics');

assert.ok(js.includes("alert.setAttribute('role','alert')"),'errors must retain alert semantics');
assert.ok(js.includes("status.setAttribute('role','status')"),'busy/system states must retain status semantics');

console.log(JSON.stringify({
  p9Certified:P9,
  changed,
  visibleTiny,
  focus:'PASS',
  disabled:'PASS',
  iconography:'PASS',
  reducedMotionStatic:'PASS'
},null,2));
