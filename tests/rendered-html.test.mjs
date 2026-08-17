import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("uses Supabase authentication and protected persistence", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const feature of ["signUp", "signInWithPassword", "signOut", "from(\"applications\")", "from(\"activities\")"]) assert.match(source, new RegExp(feature.replace(/[()]/g, "\\$&")));
  assert.doesNotMatch(source, /signin-with-chatgpt|applyflow\.users|passwordHash/);
});

test("includes complete product workflows", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const feature of ["importCsv", "exportCsv", "exportCalendar", "changeStage", "undoDelete", "confirmDelete"]) assert.match(source, new RegExp(feature));
  for (const section of ["applications", "pipeline", "analytics", "settings"]) assert.match(source, new RegExp(`id="${section}"`));
  assert.match(source, /draggable/); assert.match(source, /type="datetime-local"/);
});
