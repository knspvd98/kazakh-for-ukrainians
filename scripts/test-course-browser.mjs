import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

test("a learner can review a card and restore the exported schedule in a fresh browser", async () => {
  let server;
  let browser;
  try {
    let url = process.env.COURSE_TEST_URL;
    if (!url) {
      server = await preview({ preview: { host: "127.0.0.1", port: 0, open: false } });
      url = "http://127.0.0.1:" + server.httpServer.address().port + server.config.base;
    }
    browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
    const page = await browser.newPage();
    await page.goto(url);
    await page.getByRole("navigation").getByRole("button", { name: "Картки", exact: true }).click();
    const front = page.locator(".flashcard-front strong");
    const firstWord = await front.innerText();
    const count = page.locator(".flashcard-session span").first();
    const initialCount = Number((await count.innerText()).match(/\d+/)[0]);
    assert.ok(initialCount > 0);
    await page.getByRole("button", { name: /Показати відповідь/ }).click();
    await page.getByRole("button", { name: /Добре \/ Жақсы/ }).click();
    await page.getByText("Карток: " + (initialCount - 1), { exact: true }).waitFor();
    await page.reload();
    await page.getByRole("navigation").getByRole("button", { name: "Картки", exact: true }).click();
    await page.getByText("Карток: " + (initialCount - 1), { exact: true }).waitFor();
    if (initialCount > 1) assert.notEqual(await front.innerText(), firstWord);

    await page.getByRole("navigation").getByRole("button", { name: "Прогрес", exact: true }).click();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Експортувати прогрес" }).click();
    const file = await (await download).path();
    const state = JSON.parse(await readFile(file, "utf8"));
    const reviews = Object.values(state.reviewStats);
    assert.equal(reviews.length, 1);
    assert.equal(reviews[0].correct, 1);
    assert.ok(Date.parse(reviews[0].due) > Date.now());

    const restored = await browser.newPage();
    await restored.goto(url);
    await restored.getByRole("navigation").getByRole("button", { name: "Прогрес", exact: true }).click();
    await restored.locator('input[type="file"]').setInputFiles(file);
    await restored.getByText("Прогрес імпортовано.", { exact: true }).waitFor();
    await restored.getByRole("navigation").getByRole("button", { name: "Картки", exact: true }).click();
    await restored.getByText("Карток: " + (initialCount - 1), { exact: true }).waitFor();
  } finally {
    await browser?.close();
    if (server) await new Promise((resolve, reject) => server.httpServer.close(err => err ? reject(err) : resolve()));
  }
});
