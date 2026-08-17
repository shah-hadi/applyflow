import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", String(Date.now()));
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/"), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}
test("renders ApplyFlow without hardcoded identity", async () => {
  const response = await render(); assert.equal(response.status, 200);
  const html = await response.text(); assert.match(html, /ApplyFlow/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Hadi Khan|Portfolio demo/);
});
test("includes complete local product workflows", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const feature of ["signin-with-chatgpt", "importCsv", "exportCsv", "exportCalendar", "changeStage", "undoDelete", "confirmDelete"]) assert.match(source, new RegExp(feature));
  for (const section of ["applications", "pipeline", "analytics", "settings"]) assert.match(source, new RegExp(`id="${section}"`));
  assert.match(source, /draggable/); assert.match(source, /type="datetime-local"/);
});
