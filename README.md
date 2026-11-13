# GOMDOL Finance 🐻

**GOMDOL Wallet, Exchange & Economy** — an experimental financial dashboard for the GOMDOL ERC-20 test token.

## Existing token

- Name: 곰돌 코인
- Symbol: GOMDOL
- Network: Ethereum Sepolia
- Chain ID: 11155111
- Contract: [0xCaC4e5AF15e697e65d9CFf302B64aF1307f9E7Df](https://sepolia.etherscan.io/address/0xCaC4e5AF15e697e65d9CFf302B64aF1307f9E7Df)
- Fixed initial supply: 100,000,000 GOMDOL
- Decimals: 18

The existing token contract is not redeployed or modified by this repository.

## Current MVP

- React dashboard with MetaMask connection
- Reads the connected wallet's GOMDOL balance and on-chain total supply
- Checks that the wallet is on Sepolia
- Express API health and economy summary endpoints
- SQLite event-storage foundation
- GitHub Actions frontend build and backend test jobs

## Planned roadmap

1. Wallet: send/receive UI, transaction history and QR codes
2. Exchange: testnet order book, limit orders and trade matching
3. Economy: market metrics, fees, user profiles and admin analytics
4. Security: input validation, rate limits, audit logs and contract review

## Requirements

- Node.js 22+
- npm
- MetaMask browser extension configured for Sepolia

## Run locally

Install dependencies in each application:

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

Copy `.env.example` to `.env` if you need to customize settings. Never commit secrets.

Start both services:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- API health: http://localhost:4000/api/health

For local frontend configuration, Vite reads `VITE_GOMDOL_CONTRACT_ADDRESS` and `VITE_CHAIN_ID` from the frontend environment. The deployed contract address is also configured as a safe public fallback in the UI.

## Security model

- Wallet signatures happen in MetaMask.
- Never request or store seed phrases or private keys.
- Do not treat frontend-provided balances or prices as authoritative.
- Sepolia test tokens have no guaranteed real-world value and are not redeemable for fiat.
- The initial exchange is planned as a simulated/testnet order book until a reviewed on-chain settlement design exists.
