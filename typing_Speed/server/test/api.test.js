// End-to-end API test. Needs a local MongoDB (uses the throwaway database typing_speed_test).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { createApp } from "../src/app.js";
import { synthLog } from "../../shared/synth.js";

let server;
let base;
const jar = {};

async function call(method, path, body, who = "a") {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(jar[who] && { Cookie: jar[who] }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.get("set-cookie");
  if (set) jar[who] = set.split(";")[0];
  return { status: res.status, body: await res.json() };
}

// The server checks that the clock really ran as long as the log claims, so pretend the test started long ago.
const backdate = (id) => mongoose.connection.collection("testattempts").updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { startedAt: new Date(Date.now() - 120000) } });

before(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/typing_speed_test");
  await mongoose.connection.dropDatabase();
  await new Promise((r) => (server = createApp().listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

test("register, me, levels", async () => {
  const bad = await call("POST", "/auth/register", { name: "A", email: "nope", password: "short" });
  assert.equal(bad.status, 400);
  const ok = await call("POST", "/auth/register", { name: "Asha", email: "Asha@Example.com", password: "password123" });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.user.email, "asha@example.com");
  assert.equal((await call("GET", "/auth/me")).status, 200);
  const levels = await call("GET", "/levels");
  assert.equal(levels.body.levels.find((l) => l.id === "hard").locked, true);
  assert.equal(levels.body.levels.find((l) => l.id === "beginner").locked, false);
});

test("locked levels can't be tested", async () => {
  const r = await call("POST", "/tests/start", { level: "hard", duration: 60 });
  assert.equal(r.status, 403);
  assert.equal(r.body.error.code, "LEVEL_LOCKED");
});

test("test flow: start, submit, pass, unlock, single use", async () => {
  const start = await call("POST", "/tests/start", { level: "beginner", duration: 60 });
  assert.equal(start.status, 201);
  const log = synthLog(start.body.text, { gapMs: 150, jitter: 70, typoEvery: 7, maxMs: 60000 });
  await backdate(start.body.testId);
  const done = await call("POST", `/tests/${start.body.testId}/submit`, { keystrokes: log });
  assert.equal(done.status, 200);
  const r = done.body.result;
  assert.equal(r.status, "completed");
  assert.ok(r.netWpm > 50 && r.accuracy < 100, JSON.stringify(r));
  assert.equal(r.levelPassed, true);
  assert.deepEqual(r.newlyUnlocked, ["easy"]);
  assert.equal(r.personalBest, true);

  assert.equal((await call("POST", `/tests/${start.body.testId}/submit`, { keystrokes: log })).status, 409);
  assert.equal((await call("GET", "/auth/me")).body.user.passedLevels[0], "beginner");
  // public result page data never includes the log
  const pub = await call("GET", `/tests/${start.body.testId}`, null, "anon");
  assert.equal(pub.status, 200);
  assert.equal(pub.body.result.userName, "Asha");
  assert.equal(pub.body.result.keystrokes, undefined);
});

test("robotic keystrokes are flagged and don't count", async () => {
  const start = await call("POST", "/tests/start", { level: "easy", duration: 60 });
  const log = synthLog(start.body.text, { gapMs: 100, jitter: 0, maxMs: 30000 });
  await backdate(start.body.testId);
  const done = await call("POST", `/tests/${start.body.testId}/submit`, { keystrokes: log });
  assert.equal(done.body.result.status, "flagged");
  assert.equal(done.body.result.levelPassed, false);
});

test("another user can't submit my test", async () => {
  const start = await call("POST", "/tests/start", { level: "easy", duration: 60 });
  await call("POST", "/auth/register", { name: "Bo", email: "bo@example.com", password: "password123" }, "b");
  const r = await call("POST", `/tests/${start.body.testId}/submit`, { keystrokes: [{ k: "a", t: 0 }] }, "b");
  assert.equal(r.status, 403);
});

test("practice sessions, weak keys, history, leaderboard", async () => {
  const s = await call("POST", "/practice/sessions", {
    level: "easy", option: "time:30", netWpm: 40, rawWpm: 44, accuracy: 95, durationMs: 30000, charsTyped: 400,
    errorsByKey: { ".": 12, e: 3 }, keyCounts: { ".": 40, e: 60 },
  });
  assert.equal(s.status, 201);
  const weak = await call("GET", "/users/me/weak-keys");
  assert.equal(weak.body.keys[0].key, ".");
  assert.equal(weak.body.enoughData, true);
  assert.ok((await call("GET", "/practice/weak-drill")).body.text.length > 0);
  assert.equal((await call("GET", "/users/me/history")).body.items.length >= 2, true);
  assert.equal((await call("GET", "/users/me/stats")).body.totals.tests, 1);
  const lb = await call("GET", "/leaderboard?level=beginner&duration=60");
  assert.equal(lb.body.entries[0].name, "Asha");
  assert.equal(lb.body.entries[0].rank, 1);
});

test("text generation works for every level", async () => {
  for (const level of ["beginner", "easy", "medium", "hard", "expert", "numbers", "code"]) {
    const r = await call("GET", `/practice/${level}/text?words=30`, null, "anon");
    assert.equal(r.status, 200, level);
    assert.ok(r.body.text.length > 20, level);
  }
});

test("delete account removes everything", async () => {
  assert.equal((await call("DELETE", "/users/me")).status, 200);
  assert.equal((await call("GET", "/auth/me")).status, 401);
});
