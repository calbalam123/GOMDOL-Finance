import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { openDatabase } from "./storage/database.js";

dotenv.config({ path: process.env.ENV_FILE || "../.env" });

const DEFAULT_CONTRACT = "0xCaC4e5AF15e697e65d9CFf302B64aF1307f9E7Df";
const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const EVENT_TYPES = new Set(["transfer_sent", "transfer_received", "wallet_connected", "exchange_order", "exchange_trade"]);

export function createApp({ db }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origin === "null" || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) return callback(null, true);
      return callback(new Error("Origin not allowed"));
    }
  }));
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "gomdol-finance-api", database: "connected", timestamp: new Date().toISOString() });
  });

  app.get("/api/economy/summary", (_req, res) => {
    res.json({
      token: "GOMDOL", network: "sepolia", chainId: 11155111,
      contractAddress: process.env.GOMDOL_CONTRACT_ADDRESS || DEFAULT_CONTRACT,
      initialSupply: "100000000", exchangeMode: "simulated",
      note: "Sepolia testnet only. GOMDOL test tokens have no guaranteed real-world value."
    });
  });

  app.get("/api/events", (req, res) => {
    const wallet = String(req.query.wallet || "").toLowerCase();
    if (wallet && !ADDRESS_RE.test(wallet)) return res.status(400).json({ error: "Invalid wallet address." });
    const rows = wallet
      ? db.prepare("SELECT id, event_type AS type, wallet_address AS wallet, payload_json AS payload, created_at AS createdAt FROM app_events WHERE lower(wallet_address) = ? ORDER BY id DESC LIMIT 100").all(wallet)
      : db.prepare("SELECT id, event_type AS type, wallet_address AS wallet, payload_json AS payload, created_at AS createdAt FROM app_events ORDER BY id DESC LIMIT 100").all();
    res.json({ events: rows.map(row => ({ ...row, payload: row.payload ? JSON.parse(row.payload) : null })) });
  });

  app.post("/api/events", (req, res) => {
    const { type, wallet, payload = {} } = req.body || {};
    if (!EVENT_TYPES.has(type)) return res.status(400).json({ error: "Unsupported event type." });
    if (wallet && !ADDRESS_RE.test(wallet)) return res.status(400).json({ error: "Invalid wallet address." });
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return res.status(400).json({ error: "Payload must be an object." });
    const safePayload = JSON.stringify(payload).slice(0, 4000);
    const result = db.prepare("INSERT INTO app_events (event_type, wallet_address, payload_json) VALUES (?, ?, ?)").run(type, wallet || null, safePayload);
    res.status(201).json({ id: result.lastInsertRowid, saved: true });
  });
  return app;
}

export function startServer({ port = Number(process.env.PORT || 4000), databasePath } = {}) {
  const db = openDatabase(databasePath || process.env.DATABASE_PATH || "./data/gomdol-finance.sqlite");
  const app = createApp({ db });
  return new Promise((resolve, reject) => {
    const server = app.listen(port, "127.0.0.1", () => {
      console.log(`GOMDOL Finance API listening on http://127.0.0.1:${server.address().port}`);
      resolve({ server, db, port: server.address().port, close: () => new Promise((done, fail) => server.close(error => error ? fail(error) : (db.close(), done()))) });
    });
    server.once("error", error => { db.close(); reject(error); });
  });
}
