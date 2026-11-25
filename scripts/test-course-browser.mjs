/* global caches, indexedDB */
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

test("leaving a lesson preserves completion and saved word practice works offline", {skip:!!process.env.COURSE_TEST_URL}, async () => {
  const server=await preview({preview:{host:"127.0.0.1",port:0}});
  const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
  try {
    const context=await browser.newContext();
    const page=await context.newPage();
    await page.goto("http://127.0.0.1:"+server.httpServer.address().port+server.config.base);
    await page.getByRole("button",{name:"Розпочати навчання"}).click();
    assert.equal(await page.getByRole("button",{name:"Наступний урок",exact:true}).isEnabled(),false);
    await page.getByRole("button",{name:"До курсу",exact:true}).click();
    const nav=page.getByRole("navigation");
    await nav.getByRole("button",{name:"Прогрес",exact:true}).click();
    await page.getByText("0/52",{exact:true}).waitFor();
    await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
    await nav.getByLabel("Довідники та аудіо").selectOption("audio");
    await page.getByRole("button",{name:"Зберегти аудіо"}).click();
    await page.getByRole("button",{name:"Аудіо збережено"}).waitFor({timeout:120000});
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await page.reload();
    await nav.getByRole("button",{name:"Майстерня"}).click();
    const audioRange=await page.evaluate(async()=>{
      const names=await caches.keys();
      const cache=await caches.open(names.find(name=>name.includes(":voice:")));
      const track=(await cache.keys()).find(request=>request.url.endsWith(".mp3"));
      const response=await fetch(track.url,{headers:{Range:"bytes=0-15"}});
      return [response.status,(await response.arrayBuffer()).byteLength];
    });
    assert.deepEqual(audioRange,[206,16]);
    await page.getByLabel("Основа").selectOption("5");
    await page.getByLabel("Число").selectOption("many");
    await page.getByLabel("Значення").selectOption("where");
    await page.getByText("мектептерде",{exact:true}).waitFor();
    await page.getByRole("button",{name:"қалалар",exact:true}).click();
    await page.getByText("Гармонія голосних · 1/2").waitFor();
    await page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const req=indexedDB.open("kazakh-course-progress");req.onsuccess=()=>resolve(req.result);req.onerror=reject;});
      await new Promise((resolve,reject)=>{const tx=db.transaction("progress");tx.objectStore("progress").get("current");tx.oncomplete=resolve;tx.onerror=reject;});localStorage.clear();db.close();});
    await page.reload();await nav.getByRole("button",{name:"Майстерня"}).click();await page.getByText("Гармонія голосних · 1/2").waitFor();
    if(process.env.COURSE_SCREENSHOT) {
      await page.getByLabel("Основа").selectOption("5");
      await page.getByLabel("Число").selectOption("many");
      await page.getByLabel("Значення").selectOption("where");
      await page.getByRole("button",{name:"қалалар",exact:true}).click();
      await page.screenshot({path:process.env.COURSE_SCREENSHOT});
    }
  } finally {await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
});
