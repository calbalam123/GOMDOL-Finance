import { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Coins, LayoutDashboard, RefreshCw, Wallet } from "lucide-react";

const CONTRACT = import.meta.env.VITE_GOMDOL_CONTRACT_ADDRESS || "0xCaC4e5AF15e697e65d9CFf302B64aF1307f9E7Df";
const SEPOLIA_CHAIN_ID = BigInt(import.meta.env.VITE_CHAIN_ID || "11155111");
const ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

function shortAddress(address) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
}

export default function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("—");
  const [supply, setSupply] = useState("100,000,000");
  const [networkOk, setNetworkOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("MetaMask를 연결해 GOMDOL 잔액을 확인하세요.");

  async function refreshWallet(address = account) {
    if (!window.ethereum || !address) return;
    const provider = new BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const correctNetwork = network.chainId === SEPOLIA_CHAIN_ID;
    setNetworkOk(correctNetwork);
    if (!correctNetwork) {
      setBalance("Sepolia 네트워크 필요");
      return;
    }
    const token = new Contract(CONTRACT, ABI, provider);
    const [rawBalance, rawSupply, decimals] = await Promise.all([
      token.balanceOf(address), token.totalSupply(), token.decimals()
    ]);
    setBalance(Number(formatUnits(rawBalance, decimals)).toLocaleString("en-US", { maximumFractionDigits: 4 }));
    setSupply(Number(formatUnits(rawSupply, decimals)).toLocaleString("en-US", { maximumFractionDigits: 0 }));
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setMessage("MetaMask를 설치한 뒤 다시 시도하세요.");
        return;
      }
      setBusy(true);
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts.length) throw new Error("지갑 계정을 찾을 수 없습니다.");
      setAccount(accounts[0]);
      await refreshWallet(accounts[0]);
      setMessage("지갑이 연결되었습니다.");
    } catch (error) {
      setMessage(error.shortMessage || error.message || "지갑 연결에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!window.ethereum) return;
    const onAccounts = (accounts) => {
      const next = accounts?.[0] || "";
      setAccount(next);
      if (next) refreshWallet(next).catch((error) => setMessage(error.message));
      else setBalance("—");
    };
    const onChain = () => {
      if (account) refreshWallet(account).catch((error) => setMessage(error.message));
    };
    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccounts);
      window.ethereum.removeListener("chainChanged", onChain);
    };
  }, [account]);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">🐻</span><span>GOMDOL<span className="muted"> Finance</span></span></div>
        <div className="nav-label">WORKSPACE</div>
        <a className="nav active"><LayoutDashboard size={18}/> Overview</a>
        <a className="nav"><Wallet size={18}/> Wallet <span className="soon">LIVE</span></a>
        <a className="nav"><Coins size={18}/> Exchange <span className="soon">SOON</span></a>
        <a className="nav"><CircleDollarSign size={18}/> Economy <span className="soon">SOON</span></a>
        <div className="sidebar-note">Sepolia Testnet<br/><span>Experimental environment</span></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><div className="eyebrow">GOMDOL ECOSYSTEM</div><h1>Overview</h1></div>
          <button className="connect" onClick={connectWallet} disabled={busy}>
            <Wallet size={17}/>{busy ? "연결 중..." : account ? shortAddress(account) : "Connect Wallet"}
          </button>
        </header>

        <div className="notice"><span className="pulse"/> Sepolia 테스트넷 전용 · 실제 금전 가치가 없는 테스트 토큰입니다.</div>

        <section className="hero">
          <div><div className="eyebrow light">YOUR DIGITAL ASSET</div><h2>GOMDOL <span>GMDL</span></h2><p>곰돌 코인 통합 금융 플랫폼</p></div>
          <div className="hero-bear">🐻</div>
          <div className="hero-network">ETHEREUM / SEPOLIA</div>
        </section>

        <section className="stats">
          <article className="stat-card"><div className="stat-head">내 GOMDOL 잔액 <Coins size={18}/></div><strong>{balance}</strong><small>GOMDOL</small><div className="stat-foot">{account ? shortAddress(account) : "지갑 연결 필요"}</div></article>
          <article className="stat-card"><div className="stat-head">총 발행량 <CircleDollarSign size={18}/></div><strong>{supply}</strong><small>GOMDOL</small><div className="stat-foot">고정 발행량 · 추가 발행 없음</div></article>
          <article className="stat-card"><div className="stat-head">네트워크 상태 <RefreshCw size={18}/></div><strong className={networkOk ? "good" : "neutral"}>{networkOk ? "Connected" : "Not connected"}</strong><small>Ethereum Sepolia</small><div className="stat-foot">Chain ID: 11155111</div></article>
        </section>

        <section className="lower-grid">
          <article className="panel"><div className="panel-title">Quick actions</div><div className="actions"><button onClick={() => setMessage("송금 기능은 다음 개발 단계에서 추가됩니다.")}><ArrowUpRight/> Send</button><button onClick={() => setMessage("수신 주소 QR 기능은 다음 개발 단계에서 추가됩니다.")}><ArrowDownLeft/> Receive</button><button onClick={() => account && refreshWallet().then(() => setMessage("잔액을 새로고침했습니다.")).catch(e => setMessage(e.message))}><RefreshCw/> Refresh</button></div></article>
          <article className="panel"><div className="panel-title">Activity</div><div className="empty"><Coins size={22}/><span>아직 플랫폼 내 활동 기록이 없습니다.</span></div></article>
        </section>
        <footer>{message} <a href={`https://sepolia.etherscan.io/address/${CONTRACT}`} target="_blank" rel="noreferrer">Contract on Etherscan ↗</a></footer>
      </section>
    </main>
  );
}
