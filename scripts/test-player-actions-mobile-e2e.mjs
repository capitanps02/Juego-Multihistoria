import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173";
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 }
];

async function clickShadow(page, predicate, label) {
  const clicked = await page.evaluate(({ predicateSource, label }) => {
    const root = document.querySelector("#game")?.shadowRoot;
    if (!root) return { ok: false, reason: "shadow root missing" };
    const predicate = new Function("node", `return (${predicateSource})(node)`);
    const node = [...root.querySelectorAll("button")].find(predicate);
    if (!node) return { ok: false, reason: `button not found: ${label}` };
    node.click();
    return { ok: true };
  }, { predicateSource: predicate.toString(), label });
  assert.equal(clicked.ok, true, clicked.reason);
}

async function assertNoHorizontalOverflow(page, stage, viewportWidth) {
  const metrics = await page.evaluate(() => {
    const host = document.querySelector("#game");
    const root = host?.shadowRoot;
    const shell = root?.querySelector(".mh");
    const main = root?.querySelector("main");
    return {
      innerWidth: window.innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      hostScrollWidth: host?.scrollWidth ?? 0,
      hostClientWidth: host?.clientWidth ?? 0,
      shellScrollWidth: shell?.scrollWidth ?? 0,
      shellClientWidth: shell?.clientWidth ?? 0,
      mainScrollWidth: main?.scrollWidth ?? 0,
      mainClientWidth: main?.clientWidth ?? 0
    };
  });
  assert.equal(metrics.innerWidth, viewportWidth, `${stage}: viewport mismatch`);
  assert.ok(metrics.documentScrollWidth <= viewportWidth + 1, `${stage}: document horizontal overflow ${JSON.stringify(metrics)}`);
  assert.ok(metrics.bodyScrollWidth <= viewportWidth + 1, `${stage}: body horizontal overflow ${JSON.stringify(metrics)}`);
  if (metrics.hostClientWidth) assert.ok(metrics.hostScrollWidth <= metrics.hostClientWidth + 1, `${stage}: host horizontal overflow ${JSON.stringify(metrics)}`);
  if (metrics.shellClientWidth) assert.ok(metrics.shellScrollWidth <= metrics.shellClientWidth + 1, `${stage}: shell horizontal overflow ${JSON.stringify(metrics)}`);
  if (metrics.mainClientWidth) assert.ok(metrics.mainScrollWidth <= metrics.mainClientWidth + 1, `${stage}: main horizontal overflow ${JSON.stringify(metrics)}`);
}

async function shadowText(page) {
  return page.evaluate(() => document.querySelector("#game")?.shadowRoot?.textContent ?? "");
}

const browser = await chromium.launch({ headless: true });
const rows = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    await page.waitForFunction(() => {
      const root = document.querySelector("#game")?.shadowRoot;
      return Boolean(root && [...root.querySelectorAll("button")].some(button => button.textContent?.trim() === "Gestionar mi carrera"));
    });

    let text = await shadowText(page);
    assert.match(text, /Simular/, "SIMULAR must remain visible on initial career surface");
    await assertNoHorizontalOverflow(page, "career", viewport.width);

    await clickShadow(
      page,
      node => node.textContent?.trim() === "Gestionar mi carrera",
      "Gestionar mi carrera"
    );
    await page.waitForFunction(() => document.querySelector("#game")?.shadowRoot?.textContent?.includes("¿Qué quieres hacer?"));
    text = await shadowText(page);
    assert.match(text, /Estas acciones son opcionales/, "optionality copy missing");
    await assertNoHorizontalOverflow(page, "player_action_menu", viewport.width);

    const openedCareer = await page.evaluate(() => {
      const root = document.querySelector("#game")?.shadowRoot;
      if (!root) return false;
      const cards = [...root.querySelectorAll(".player-action-card")];
      const card = cards.find(row => /\bCarrera\b/.test(row.textContent ?? ""));
      const button = card ? [...card.querySelectorAll("button")].find(node => node.textContent?.trim() === "Ver acciones") : null;
      button?.click();
      return Boolean(button);
    });
    assert.equal(openedCareer, true, "Carrera category not reachable");
    await page.waitForFunction(() => document.querySelector("#game")?.shadowRoot?.textContent?.includes("Hablar con entrenador"));
    await assertNoHorizontalOverflow(page, "career_category", viewport.width);

    const openedCoach = await page.evaluate(() => {
      const root = document.querySelector("#game")?.shadowRoot;
      if (!root) return false;
      const cards = [...root.querySelectorAll(".player-action-card")];
      const card = cards.find(row => /Hablar con entrenador/.test(row.textContent ?? ""));
      const button = card ? [...card.querySelectorAll("button")].find(node => node.textContent?.trim() === "Abrir") : null;
      button?.click();
      return Boolean(button);
    });
    assert.equal(openedCoach, true, "coach action not reachable");
    await page.waitForFunction(() => document.querySelector("#game")?.shadowRoot?.textContent?.includes("¿Con quién?"));
    text = await shadowText(page);
    assert.match(text, /Quiero más minutos/, "coach option missing");
    await assertNoHorizontalOverflow(page, "coach_detail", viewport.width);

    await clickShadow(
      page,
      node => node.textContent?.trim() === "Quiero más minutos",
      "Quiero más minutos"
    );
    await page.waitForFunction(() => document.querySelector("#game")?.shadowRoot?.textContent?.includes("ACCIÓN COMPLETADA"));
    await assertNoHorizontalOverflow(page, "action_result", viewport.width);

    await clickShadow(
      page,
      node => node.textContent?.trim() === "Volver a carrera",
      "Volver a carrera"
    );
    await page.waitForFunction(() => {
      const root = document.querySelector("#game")?.shadowRoot;
      return Boolean(root && [...root.querySelectorAll("button")].some(button => button.textContent?.trim() === "Simular"));
    });
    text = await shadowText(page);
    assert.match(text, /Simular/, "SIMULAR not reachable after Player Action");
    await assertNoHorizontalOverflow(page, "return_to_career", viewport.width);

    const accessibility = await page.evaluate(() => {
      const root = document.querySelector("#game")?.shadowRoot;
      const buttons = root ? [...root.querySelectorAll("button")] : [];
      const main = root?.querySelector("main");
      return {
        buttons: buttons.length,
        disabledWithTabIndex: buttons.filter(button => button.disabled && button.tabIndex > 0).length,
        mainExists: Boolean(main),
        mainAriaBusy: main?.getAttribute("aria-busy")
      };
    });
    assert.ok(accessibility.buttons > 0);
    assert.equal(accessibility.disabledWithTabIndex, 0);
    assert.equal(accessibility.mainExists, true);

    rows.push({ viewport: `${viewport.width}x${viewport.height}`, result: "PASS" });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({
  gate: "PA-GATE-14 MOBILE",
  surface: "web/game-ui via real Chromium",
  flow: "career -> manage -> career category -> coach target -> more minutes -> result -> career",
  rows,
  result: "PASS"
}, null, 2));
