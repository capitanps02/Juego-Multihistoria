import assert from "node:assert/strict";
import { chromium } from "playwright";
import { GameSession } from "../dist/session/game-session.js";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173";
const KEY = "historia-jugador.preview.session.v1";

const fixture = await GameSession.create(424242, {
  microfeeds: false,
  sessionId: "a6-preview-e2e"
});
const raw = JSON.stringify(fixture.exportSnapshot());

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, value);
    localStorage.removeItem(key + ".previous");
  }, { key: KEY, value: raw });

  await page.goto(baseUrl + "/classic", { waitUntil: "networkidle" });

  const storyButton = async label => {
    const locator = page.locator("#story button").filter({ hasText: label }).first();
    await locator.waitFor({ state: "visible", timeout: 10000 });
    return locator;
  };

  const waitStoryText = async text => {
    await page.locator("#story").filter({ hasText: text }).waitFor({ state: "visible", timeout: 10000 });
  };

  const noOverflow = async stage => {
    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      doc: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      story: document.querySelector("#story")?.scrollWidth ?? 0,
      storyClient: document.querySelector("#story")?.clientWidth ?? 0
    }));
    assert.ok(metrics.doc <= metrics.innerWidth + 1, `${stage}: document overflow ${JSON.stringify(metrics)}`);
    assert.ok(metrics.body <= metrics.innerWidth + 1, `${stage}: body overflow ${JSON.stringify(metrics)}`);
    if (metrics.storyClient) {
      assert.ok(metrics.story <= metrics.storyClient + 1, `${stage}: story overflow ${JSON.stringify(metrics)}`);
    }
  };

  const manageReady = await page.locator("#story button")
    .filter({ hasText: "Gestionar mi carrera" })
    .first()
    .waitFor({ state: "visible", timeout: 10000 })
    .then(() => true)
    .catch(() => false);

  if (!manageReady) {
    const diagnostic = await page.evaluate(() => ({
      story: document.querySelector("#story")?.textContent ?? "",
      error: document.querySelector("#error")?.textContent ?? "",
      save: document.querySelector("#save-status")?.textContent ?? "",
      buttons: [...document.querySelectorAll("#story button")].map(button => ({
        text: button.textContent?.trim() ?? "",
        disabled: button.disabled
      }))
    }));
    throw new Error(`classic preview initial career surface missing: ${JSON.stringify(diagnostic)}`);
  }

  await noOverflow("career");
  await (await storyButton("Gestionar mi carrera")).click();
  await waitStoryText("¿Qué quieres hacer?");
  await waitStoryText("Estas acciones son opcionales");
  await noOverflow("menu");

  await (await storyButton("Carrera")).click();
  await waitStoryText("Hablar con entrenador");
  await noOverflow("category");

  await (await storyButton("Hablar con entrenador")).click();
  await waitStoryText("¿CON QUIÉN?");
  await noOverflow("detail");

  const choose = page.locator("#story button").filter({ hasText: "Elegir" }).first();
  if (await choose.count() && await choose.isVisible() && await choose.isEnabled()) {
    await choose.click();
  }

  const moreMinutes = await storyButton("Quiero más minutos");
  assert.equal(await moreMinutes.isEnabled(), true, "coach option should be executable after target selection");
  await moreMinutes.click();

  await waitStoryText("ACCIÓN COMPLETADA");
  await noOverflow("result");

  await (await storyButton("Volver a carrera")).click();
  const simulate = await storyButton("Simular");
  assert.equal(await simulate.isVisible(), true);
  await noOverflow("return");

  const timelineText = await page.locator("#history").innerText();
  assert.match(timelineText, /Hablar con entrenador|más minutos|Acción/i);

  const busy = await page.locator("#story").getAttribute("aria-busy");
  assert.ok(busy === "false" || busy === null);

  console.log(JSON.stringify({
    gate: "PA-GATE-12 PREVIEW",
    viewport: "1280x900",
    flow: "career -> manage -> Carrera -> coach target -> more minutes -> result -> career",
    result: "PASS"
  }, null, 2));

  await context.close();
} finally {
  await browser.close();
}
