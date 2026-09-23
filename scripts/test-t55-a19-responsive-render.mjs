import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl=process.env.RESPONSIVE_URL || 'http://127.0.0.1:4173/';
const widths=[390,768,1440];

function assertBounds(label, metrics, width) {
  assert.ok(metrics.documentScrollWidth <= width + 2, `${label}: document overflow ${metrics.documentScrollWidth} > ${width}`);
  assert.ok(metrics.hostRight <= width + 2 && metrics.hostLeft >= -2, `${label}: game host clipped`);
  assert.ok(metrics.shellScrollWidth <= metrics.shellClientWidth + 2, `${label}: shell horizontal overflow ${metrics.shellScrollWidth} > ${metrics.shellClientWidth}`);
  assert.ok(metrics.mainScrollWidth <= metrics.mainClientWidth + 2, `${label}: main horizontal overflow ${metrics.mainScrollWidth} > ${metrics.mainClientWidth}`);
}

async function metrics(page) {
  return page.evaluate(() => {
    const host=document.querySelector('#game');
    const root=host?.shadowRoot;
    const shell=root?.querySelector('.mh');
    const main=root?.querySelector('main');
    const hostRect=host?.getBoundingClientRect();
    return {
      documentScrollWidth:document.documentElement.scrollWidth,
      hostLeft:hostRect?.left ?? 0,
      hostRight:hostRect?.right ?? 0,
      shellScrollWidth:shell?.scrollWidth ?? 0,
      shellClientWidth:shell?.clientWidth ?? 0,
      mainScrollWidth:main?.scrollWidth ?? 0,
      mainClientWidth:main?.clientWidth ?? 0
    };
  });
}

async function waitLoaded(page) {
  await page.waitForFunction(() => {
    const root=document.querySelector('#game')?.shadowRoot;
    return Boolean(root?.querySelector('.mh') && root?.querySelector('nav[aria-label="Navegación principal"]') && root?.querySelector('main') && !root?.querySelector('.busy-status'));
  }, null, { timeout:15000 });
}

for (const width of widths) {
  const context=await chromium.launch({headless:true}).then(async browser => ({browser,ctx:await browser.newContext({viewport:{width,height:900}})}));
  const page=await context.ctx.newPage();
  const pageErrors=[];
  page.on('pageerror',err=>pageErrors.push(String(err)));
  page.on('console',msg=>{ if(msg.type()==='error') pageErrors.push(msg.text()); });

  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
  await waitLoaded(page);

  assert.equal(pageErrors.length,0,`width ${width}: browser errors: ${pageErrors.join(' | ')}`);
  assertBounds(`home@${width}`,await metrics(page),width);

  const simular=page.getByRole('button',{name:/^(Simular|Pausar simulación|Reanudar simulación|Una decisión te espera|Revisar oferta)$/}).first();
  await assert.doesNotReject(()=>simular.waitFor({state:'visible',timeout:5000}),`width ${width}: primary CTA not visible`);
  for (const label of ['Forma','Estado físico','Fatiga']) {
    await assert.doesNotReject(()=>page.getByText(label,{exact:true}).first().waitFor({state:'visible',timeout:3000}),`width ${width}: stat ${label} missing`);
  }

  await page.getByRole('button',{name:'Carrera',exact:true}).click();
  await page.waitForTimeout(80);
  assertBounds(`career@${width}`,await metrics(page),width);
  await assert.doesNotReject(()=>page.getByText(/HISTORIAL VIVO DE TU TRAYECTORIA|Tu carrera empieza aquí/).first().waitFor({state:'visible',timeout:3000}));

  await page.getByRole('button',{name:'Mundo',exact:true}).click();
  await page.waitForTimeout(80);
  assertBounds(`world@${width}`,await metrics(page),width);
  assert.equal(await page.getByRole('button',{name:'Mundo',exact:true}).getAttribute('aria-current'),'page');

  await page.getByRole('button',{name:'Tu partida',exact:true}).last().click();
  await page.waitForTimeout(80);
  assertBounds(`save@${width}`,await metrics(page),width);
  await assert.doesNotReject(()=>page.getByLabel('Código de historia de la nueva carrera').waitFor({state:'visible',timeout:3000}));

  await page.getByRole('button',{name:'Inicio',exact:true}).click();
  await page.waitForTimeout(80);

  // Try to reach a real interactive scene. This is deterministic for the default seed,
  // but the responsive gate does not fabricate state if a bounded block ends first.
  const primary=page.getByRole('button',{name:'Simular',exact:true});
  if(await primary.count()) {
    await primary.click();
    try {
      await page.waitForFunction(() => {
        const root=document.querySelector('#game')?.shadowRoot;
        return Boolean(root?.querySelector('.immersive') || root?.querySelector('button.primary'));
      }, null, {timeout:5000});
    } catch {}
    assertBounds(`post-sim@${width}`,await metrics(page),width);
  }

  assert.equal(pageErrors.length,0,`width ${width}: browser errors after navigation: ${pageErrors.join(' | ')}`);
  console.log(`RESPONSIVE width=${width} PASS`);
  await context.ctx.close();
  await context.browser.close();
}
console.log('RESPONSIVE_RENDER 3/3 PASS');
