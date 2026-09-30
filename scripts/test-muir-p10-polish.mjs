import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P9='21b7eb5fa1df25863a7018cd33eddfbab792c113';
const read=p=>fs.readFileSync(p,'utf8');
const gitRaw=(...args)=>execFileSync('git',args,{encoding:'utf8'});
const git=(...args)=>gitRaw(...args).trim();

assert.equal(git('merge-base',P9,'HEAD'),P9,'P10 must descend from exact certified P9');

const changed=git('diff','--name-only',P9+'..HEAD').split('\n').filter(Boolean);
const forbidden=changed.filter(p=>p.startsWith('src/')||p==='web/indexed-save-store.js'||p.startsWith('data/football/'));
assert.deepEqual(forbidden,[],'P10 must not change gameplay, persistence or Football DB authority');

const css=read('web/game-ui.css');
const js=read('web/game-ui.js');
const p9js=gitRaw('show',P9+':web/game-ui.js');

for(const token of [
  '--muir-space-1:6px','--muir-space-8:24px',
  '--muir-radius-small:10px','--muir-radius-control:14px',
  '--muir-radius-medium:18px','--muir-radius-panel:24px',
  '--muir-radius-immersive:27px','--muir-radius-pill:999px',
  '--muir-type-caption:10px','--muir-focus-outline:3px solid #409cff',
  '--muir-focus-offset:5px','--muir-motion-control:180ms'
]) assert.ok(css.includes(token),'missing P1 production token '+token);

assert.ok(!/cursor\s*:\s*wait/.test(css),'disabled controls must not globally look like loading');
assert.ok(css.includes('button:disabled{cursor:not-allowed;opacity:var(--muir-disabled-opacity)}'),'disabled semantics must be explicit');
assert.ok(css.includes('a:focus-visible'),'anchors need the same focus-visible contract');
assert.ok(css.includes('main:focus-visible'),'focusable main needs visible focus');
assert.ok(css.includes('.timeline [data-journal-index]:focus-visible'),'timeline focus must use focus-visible');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'),'reduced-motion contract must remain present');

const rgb=hex=>[0,2,4].map(i=>parseInt(hex.slice(1+i,3+i),16)/255);
const luminance=hex=>{
  const [r,g,b]=rgb(hex).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
  return 0.2126*r+0.7152*g+0.0722*b;
};
const contrast=(a,b)=>{
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
};
assert.ok(contrast('#ffffff','#0a6dcc')>=4.5,'primary CTA gradient start must meet AA normal-text contrast');
assert.ok(contrast('#ffffff','#075fbd')>=4.5,'primary CTA gradient end must meet AA normal-text contrast');
assert.ok(contrast('#8b8b90','#202023')>=4.5,'small muted text must meet AA on surface-2');
assert.ok(css.includes('--muir-primary-start:#0a6dcc')&&css.includes('--muir-primary-end:#075fbd'),'accessible primary gradient tokens missing');
assert.ok(css.includes('--muir-text-small-muted:#8b8b90'),'small-text contrast token missing');
assert.ok(css.includes('--muir-disabled-opacity:.58'),'shared disabled opacity token missing');
assert.ok(css.includes('--muir-error-bg:#382224')&&css.includes('--muir-error-border:#ff453a80'),'shared error tokens missing');
assert.ok(css.includes('--muir-loading-bg:#17171be8')&&css.includes('--muir-loading-border:#409cff88'),'shared loading tokens missing');
assert.ok(css.includes('--muir-empty-color:#a1a1a6'),'shared empty-state token missing');
assert.ok(css.includes('.semantic-empty{color:var(--muir-empty-color)}'),'empty state must use shared semantic token');
assert.ok(css.includes('.player-action-card button:disabled,.player-action-option button:disabled{opacity:var(--muir-disabled-opacity);cursor:not-allowed}'),'Player Actions disabled state must use shared semantics');

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
