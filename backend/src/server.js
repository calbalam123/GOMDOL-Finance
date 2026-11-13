import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { openDatabase } from "./storage/database.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "32kb" }));

const db = openDatabase(process.env.DATABASE_PATH || "./data/gomdol-finance.sqlite");

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "gomdol-finance-api",
    database: db ? "connected" : "unavailable",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/economy/summary", (_req, res) => {
  res.json({
    token: "GOMDOL",
    network: "sepolia",
    chainId: 11155111,
    contractAddress: process.env.GOMDOL_CONTRACT_ADDRESS || "0xCaC4e5AF15e697e65d9CFf302B64aF1307f9E7Df",
    initialSupply: "100000000",
    note: "Testnet data only; this token has no guaranteed real-world value."
  });
});

app.listen(port, () => {
  console.log(`GOMDOL Finance API listening on http://localhost:${port}`);
});
