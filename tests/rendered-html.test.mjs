import assert from "node:assert/strict";
import test from "node:test";
async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", String(Date.now()));
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/"), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}
test("renders the ApplyFlow dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /ApplyFlow/);
  assert.match(html, /Good morning/);
  assert.match(html, /Add application/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});
