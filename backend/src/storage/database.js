import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function openDatabase(filePath) {
  const absolutePath = resolve(filePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  const db = new Database(absolutePath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      wallet_address TEXT,
      payload_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_app_events_created_at
      ON app_events(created_at);
  `);
  return db;
}
