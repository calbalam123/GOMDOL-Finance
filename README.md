# GOMDOL Finance 🐻

**GOMDOL Wallet, Exchange & Economy** — a Windows desktop application for the GOMDOL ERC-20 test token. This project is packaged as a Windows `.exe`; it is not intended to be deployed as a public website.

## Existing token

- Name: 곰돌 코인
- Symbol: GOMDOL
- Network: Ethereum Sepolia
- Chain ID: 11155111
- Contract: [0xCaC4e5AF15e697e65d9CFf302B64aF1307f9E7Df](https://sepolia.etherscan.io/address/0xCaC4e5AF15e697e65d9CFf302B64aF1307f9E7Df)
- Fixed initial supply: 100,000,000 GOMDOL
- Decimals: 18

The existing token contract is not redeployed or modified by this repository.

## Desktop app

- Electron desktop shell with a local bundled React interface
- Electron starts a loopback-only Express API and persistent SQLite database automatically
- Activity events are stored under the current Windows user's application data directory
- Backend API health and activity history are visible in the desktop dashboard
- Windows x64 NSIS installer target
- Application title: GOMDOL Finance
- Secure BrowserWindow defaults: context isolation enabled, Node integration disabled, sandbox enabled
- External links are opened in the user's default browser

## Build the Windows EXE locally

Requirements: Windows 10/11, Node.js 22+, and npm.

```powershell
npm install
npm --prefix frontend install
npm run build:win
```

The installer is generated under `release/\` as `GOMDOL-Finance-Setup-0.2.0.exe`.

For desktop UI development:

```powershell
npm install
npm --prefix frontend install
npm run dev:desktop
```

## GitHub Actions

The **Windows EXE** workflow runs on pushes to `main` and can also be started manually from the Actions tab. It uploads the generated installer as a workflow artifact. Download it from the successful workflow run's Artifacts section.

## Current MVP and next work

- Desktop shell and Windows installer pipeline
- React dashboard with GOMDOL contract information
- Existing browser MetaMask injection flow is not available automatically inside Electron. A desktop-compatible WalletConnect connection must be added before wallet operations can be used in the packaged app.
- Next: WalletConnect, token balance and transfer UI, transaction history and QR codes
- Next: testnet exchange order book and simulated limit-order matching
- Next: economy statistics, fees, profiles and admin analytics

## Security and network notes

- The token is deployed on Sepolia testnet; test tokens have no guaranteed real-world value and are not redeemable for fiat.
- Never request or store seed phrases or private keys.
- Do not commit `.env`, API keys, private keys, or wallet secrets.
- Exchange matching is planned as a simulated/testnet feature until an audited on-chain settlement design exists.
