import assert from "node:assert/strict";
import { chromium } from "playwright";
import { GameSession } from "../dist/session/game-session.js";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173";
const STORAGE_KEY = "historia-jugador.preview.session.v1";
const fixture = await GameSession.create(424242, { events: [], microfeeds: false, sessionId: "a6-mobile-e2e" });
const fixtureRaw = JSON.stringify(fixture.exportSnapshot());
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 }
];

async function clickShadow(page, label) {
  const clicked = await page.evaluate(labelText => {
    const root = document.querySelector("#game")?.shadowRoot;
    if (!root) return { ok: false, reason: "shadow root missing" };
    const node = [...root.querySelectorAll("button")]
      .find(button => button.textContent?.trim() === labelText);
    if (!node) return { ok: false, reason: `button not found: ${labelText}` };
    node.click();
    return { ok: true };
  }, label);
  assert.equal(clicked.ok, true, clicked.reason);
}

async function clickCardButton(page, cardTitle, buttonLabel) {
  const clicked = await page.evaluate(({ cardTitleText, buttonLabelText }) => {
    const root = document.querySelector("#game")?.shadowRoot;
    if (!root) return { ok: false, reason: "shadow root missing" };
    const cards = [...root.querySelectorAll(".player-action-card")];
    const card = cards.find(node => {
      const heading = node.querySelector("h2,h3");
      return heading?.textContent?.trim() === cardTitleText;
    });
    if (!card) return { ok: false, reason: `card not found: ${cardTitleText}` };
    const button = [...card.querySelectorAll("button")]
      .find(node => node.textContent?.trim() === buttonLabelText && !node.disabled);
    if (!button) return { ok: false, reason: `button not found in ${cardTitleText}: ${buttonLabelText}` };
    button.click();
    return { ok: true };
  }, { cardTitleText: cardTitle, buttonLabelText: buttonLabel });
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
    await page.addInitScript(({ key, value }) => {
      localStorage.setItem(key, value);
      localStorage.removeItem(key + ".previous");
    }, { key: STORAGE_KEY, value: fixtureRaw });
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    await page.waitForFunction(() => {
      const root = document.querySelector("#game")?.shadowRoot;
      return Boolean(root && [...root.querySelectorAll("button")].some(button => button.textContent?.trim() === "Gestionar mi carrera"));
    });

    let text = await shadowText(page);
    assert.match(text, /Simular/, "SIMULAR must remain visible on initial career surface");
    await assertNoHorizontalOverflow(page, "career", viewport.width);

    await clickShadow(page, "Gestionar mi carrera");
    await page.waitForFunction(() => document.querySelector("#game")?.shadowRoot?.textContent?.includes("¿Qué quieres hacer?"));
    text = await shadowText(page);
    assert.match(text, /Estas acciones son opcionales/, "optionality copy missing");
    await assertNoHorizontalOverflow(page, "player_action_menu", viewport.width);

    await clickCardButton(page, "Carrera", "Ver acciones");
    await page.waitForFunction(() => document.querySelector("#game")?.shadowRoot?.textContent?.includes("Hablar con entrenador"));
    await assertNoHorizontalOverflow(page, "career_category", viewport.width);

    await clickCardButton(page, "Hablar con entrenador", "Abrir");
    await page.waitForFunction(() => document.querySelector("#game")?.shadowRoot?.textContent?.includes("¿Con quién?"));
    await assertNoHorizontalOverflow(page, "coach_detail", viewport.width);

    const targetState = await page.evaluate(() => {
      const root = document.querySelector("#game")?.shadowRoot;
      if (!root) return { selected: false, chose: false, targets: 0 };
      const targetCards = [...root.querySelectorAll(".player-action-target")];
      const buttons = targetCards.flatMap(card => [...card.querySelectorAll("button")]);
      const selected = buttons.some(button => button.textContent?.trim() === "Seleccionado");
      const choose = buttons.find(button => button.textContent?.trim() === "Elegir" && !button.disabled);
      if (!selected && choose) choose.click();
      return { selected, chose: Boolean(choose), targets: targetCards.length };
    });
    assert.ok(targetState.targets >= 1, "coach target not projected");
    assert.ok(targetState.selected || targetState.chose, "no available coach target");

    await page.waitForFunction(() => {
      const root = document.querySelector("#game")?.shadowRoot;
      return Boolean(root && [...root.querySelectorAll("button")].some(
        button => button.textContent?.trim() === "Quiero más minutos" && !button.disabled
      ));
    });
    text = await shadowText(page);
    assert.match(text, /Quiero más minutos/, "coach option missing");

    await clickShadow(page, "Quiero más minutos");
    await page.waitForFunction(() => document.querySelector("#game")?.shadowRoot?.textContent?.includes("ACCIÓN COMPLETADA"));
    await assertNoHorizontalOverflow(page, "action_result", viewport.width);

    await clickShadow(page, "Volver a carrera");
    await page.waitForFunction(() => {
      const root = document.querySelector("#game")?.shadowRoot;
      return Boolean(root && [...root.querySelectorAll("button")].some(button =>
        button.textContent?.trim().toLowerCase().startsWith("simular")
      ));
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
