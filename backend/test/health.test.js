import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase } from "../src/storage/database.js";

test("SQLite storage initializes the event table", () => {
  const dir = mkdtempSync(join(tmpdir(), "gomdol-finance-"));
  const db = openDatabase(join(dir, "test.sqlite"));
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='app_events'").get();
  assert.equal(table.name, "app_events");
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
