import assert from "node:assert/strict";
import { chromium } from "playwright";
import { GameSession } from "../dist/session/game-session.js";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173";
const KEY = "historia-jugador.preview.session.v1";

const fixture = await GameSession.create(424242, {
  events: [],
  microfeeds: false,
  sessionId: "a6-preview-e2e"
});
const raw = JSON.stringify(fixture.exportSnapshot());

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, value);
    localStorage.removeItem(key + ".previous");
  }, { key: KEY, value: raw });

  await page.goto(baseUrl + "/classic", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Gestionar mi carrera", exact: true }).waitFor();

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
    if (metrics.storyClient) assert.ok(metrics.story <= metrics.storyClient + 1, `${stage}: story overflow ${JSON.stringify(metrics)}`);
  };

  await noOverflow("career");
  await page.getByRole("button", { name: "Gestionar mi carrera", exact: true }).click();
  await page.getByText("Estas acciones son opcionales.", { exact: false }).waitFor();
  await noOverflow("menu");

  await page.getByRole("button", { name: "Carrera", exact: true }).click();
  await page.getByRole("button", { name: "Hablar con entrenador", exact: true }).waitFor();
  await noOverflow("category");

  await page.getByRole("button", { name: "Hablar con entrenador", exact: true }).click();
  await page.getByText("¿CON QUIÉN?", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Quiero más minutos", exact: true }).waitFor();
  await noOverflow("detail");

  await page.getByRole("button", { name: "Quiero más minutos", exact: true }).click();
  await page.getByText("ACCIÓN COMPLETADA", { exact: true }).waitFor();
  await page.getByText("Has dejado claro que quieres competir por más minutos.", { exact: true }).waitFor();
  await noOverflow("result");

  await page.getByRole("button", { name: "Volver a carrera", exact: true }).click();
  await page.getByRole("button", { name: "Simular", exact: true }).waitFor();
  const text = await page.locator("body").innerText();
  assert.match(text, /Tu recorrido · 1 momento|Acción voluntaria|Has dejado claro que quieres competir por más minutos/);
  await noOverflow("return");

  const busy = await page.locator("#story").getAttribute("aria-busy");
  assert.ok(busy === "false" || busy === null);

  console.log(JSON.stringify({
    gate: "PA-GATE-12 PREVIEW",
    viewport: "390x844",
    flow: "career -> manage -> Carrera -> coach target -> more minutes -> result -> career",
    result: "PASS"
  }, null, 2));

  await context.close();
} finally {
  await browser.close();
}
