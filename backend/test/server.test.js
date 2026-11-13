import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase } from "../src/storage/database.js";
import { createApp } from "../src/server.js";

test("local API health and activity persistence", async () => {
  const directory = mkdtempSync(join(tmpdir(), "gomdol-finance-"));
  const db = openDatabase(join(directory, "test.sqlite"));
  const server = createApp({ db }).listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, "ok");

    const wallet = "0x1234567890123456789012345678901234567890";
    const created = await fetch(`${base}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "wallet_connected", wallet, payload: { network: "sepolia" } })
    });
    assert.equal(created.status, 201);

    const history = await fetch(`${base}/api/events?wallet=${wallet}`);
    const body = await history.json();
    assert.equal(body.events.length, 1);
    assert.equal(body.events[0].type, "wallet_connected");

    const invalid = await fetch(`${base}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "unknown_event" })
    });
    assert.equal(invalid.status, 400);
  } finally {
    await new Promise(resolve => server.close(resolve));
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
