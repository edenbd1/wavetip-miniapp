# 🌊 WaveTip — USDC Tipping for Twitch on Base 💰

> **Watch. Connect. Tip.** Bring crypto tipping to Twitch with **USDC on Base** — fast, seamless, and secure.

[➡️ Open Mini App](https://wavetip-fi.vercel.app)

---

<div align="center">
  <img src="public/logo_wavetip.png" alt="WaveTip Logo" width="160" />
  <p><em>Watch live Twitch streams and send USDC tips to your favorite creators — all powered by Base.</em></p>
</div>

---

## ✨ What is WaveTip?

**WaveTip** is a **Farcaster Mini App** that enables viewers to watch **Twitch streams** and send **USDC tips** directly on **Base Sepolia** — creating a seamless, low-fee **tipping economy** for the streaming community.

Whether you're a **viewer** discovering new content or a **creator** building your community, WaveTip makes crypto-native support fast, fun, and frictionless.

---

## ⚡ Start Tipping Now

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=20&duration=3000&pause=1000&color=006AFE&center=true&vCenter=true&width=700&lines=💸+Tip+your+favorite+streamers+instantly;🌐+Built+on+Base+for+speed+%26+efficiency;🔐+Secure,+non-custodial,+user-controlled" alt="Typing SVG" />
</p>

[➡️ Launch WaveTip](https://wavetip-fi.vercel.app)

---

## 🚀 Core Features

| 🎮 Live Streaming | 💸 Crypto Tipping | 🔗 Wallet Integration |
|-------------------|------------------|----------------------|
| Watch Twitch streams directly in the app with full Twitch embed support. | Send USDC to streamers in just a few clicks — choose from preset amounts or custom tips. | Connect your wallet via Coinbase Smart Wallet for seamless transactions. |

| 📊 Activity Feed | 👤 Profile Management | 🔍 Stream Discovery |
|-----------------|----------------------|---------------------|
| Track all your tips with timestamps, amounts, and transaction statuses. | View your total tips count and amount spent across all streamers. | Search any Twitch channel and start watching + tipping instantly. |

---

## 🔍 Feature Breakdown

### 🎯 For Viewers
- **Search & Watch** any Twitch stream directly in the app
- **Quick Tipping** with preset amounts ($1, $2, $5, Custom)
- **Wallet Connect** via OnchainKit & Coinbase Smart Wallet
- **Activity History** to track all your tips
- **Profile Stats** showing total tips sent and amount
- **Browse Categories** — discover popular games & streams

### 🎬 For Streamers
- Receive **USDC tips** directly to the WaveTip smart contract
- Tips are **tagged with your channel name** for easy tracking
- **1% platform fee** — competitive and transparent
- **Base Sepolia network** for fast, low-cost transactions
- Future: Dashboard to track and withdraw earnings

---

## 🏗️ How It Works

1. **Connect Your Wallet** — Use Coinbase Smart Wallet or any Base-compatible wallet
2. **Search for a Stream** — Enter any Twitch channel name
3. **Watch & Enjoy** — Full Twitch embed experience
4. **Send a Tip** — Choose an amount and confirm the transaction
5. **Track Your Tips** — View your tipping history in the Activity tab

### 🔐 Smart Contract

```solidity
// WaveTip Contract on Base Sepolia
Contract Address: 0xD0c8Ca68cc81fF4486d5D725fCE612ddFeb0672D
USDC Address: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
Network: Base Sepolia (Chain ID: 84532)
```

**Function**: `tip(string streamerTag, string tipType, uint256 amount)`

All tips are sent to the smart contract with the streamer's channel name tagged in the transaction for future distribution.

---

## 💰 Pricing & Fees

| Fee Type | Amount | Description |
|----------|--------|-------------|
| **Platform Fee** | 1% | Charged on each tip to support platform development |
| **Network Fee** | ~$0.01 | Base Sepolia gas fees (minimal) |
| **Minimum Tip** | $1 USDC | Ensures tips are meaningful |

---

## ❓ Frequently Asked Questions

<details>
  <summary>🤔 What is WaveTip?</summary>
  <p><strong>WaveTip</strong> is a Farcaster Mini App that lets you watch Twitch streams and send tips to creators using USDC on Base with only 1% fees.</p>
</details>

<details>
  <summary>🎯 Which platforms are supported?</summary>
  <p>Currently, WaveTip supports <strong>Twitch</strong> streams. You can search any Twitch channel and start tipping immediately.</p>
</details>

<details>
  <summary>💸 How do I send a tip to a streamer?</summary>
  <p>Once you connect your wallet and search for a stream, simply click the WaveTip button, choose the amount you'd like to send, and confirm the transaction.</p>
</details>

<details>
  <summary>💵 What are the fees?</summary>
  <p>WaveTip charges a <strong>1% platform fee</strong> on each tip. Network fees on Base Sepolia are minimal (~$0.01).</p>
</details>

<details>
  <summary>🌐 What blockchain does WaveTip use?</summary>
  <p>WaveTip is built on <strong>Base Sepolia</strong> (testnet) using <strong>USDC</strong> as the tipping currency.</p>
</details>

<details>
  <summary>⚠️ Is this real money?</summary>
  <p>Currently, WaveTip runs on <strong>Base Sepolia testnet</strong>. While you can get testnet USDC for testing, this is for <strong>demonstration purposes</strong>. Mainnet launch coming soon!</p>
</details>

<details>
  <summary>🔒 Is my wallet safe?</summary>
  <p>Yes! WaveTip uses <strong>OnchainKit</strong> and <strong>Coinbase Smart Wallet</strong> for secure, non-custodial wallet connections. You maintain full control of your assets.</p>
</details>

<details>
  <summary>📱 Where can I use WaveTip?</summary>
  <p>WaveTip is a <strong>Farcaster Mini App</strong> accessible through Farcaster-compatible clients like Warpcast.</p>
</details>

---

## 🧬 Built on Base

WaveTip is proudly built on **Base**, Coinbase's Ethereum L2 solution — offering fast, low-cost, and secure transactions perfect for microtipping.

[🔍 Learn more about Base](https://base.org)

---

## 🏗️ Tech Stack

### Frontend
- ⚛️ **Next.js 15** — React framework with App Router
- 🎨 **CSS Modules** — Scoped styling
- 🔗 **OnchainKit** — Wallet connection & blockchain interactions
- 💳 **Coinbase Smart Wallet** — Seamless wallet experience
- 🎮 **Twitch Embed** — Native stream integration

### Blockchain
- 💵 **USDC** — Stablecoin for tips
- 🔷 **Base Sepolia** — Ethereum L2 testnet
- 🔒 **Wagmi** — React hooks for Ethereum
- 🔮 **Viem** — TypeScript Ethereum library
- 📝 **Smart Contract** — Custom tipping logic

### Farcaster
- 🟣 **MiniKit** — Farcaster Mini App SDK
- 👤 **Farcaster Auth** — User identity & profile
- 🖼️ **Frames** — Social media integration

---

## 🚀 Getting Started (For Developers)

### Prerequisites

```bash
Node.js 18+
npm or pnpm
Base Sepolia testnet USDC
Farcaster account
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wavetip-mini-app.git

# Navigate to the project
cd wavetip-mini-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your configuration
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key_here

# Run the development server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📦 Project Structure

```
wavetip-mini-app/
├── app/
│   ├── [channel]/        # Dynamic Twitch stream pages
│   ├── api/              # API routes (auth, etc.)
│   ├── success/          # Success page after tipping
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Main app (Home, Activity, Profile, About)
│   └── rootProvider.tsx  # OnchainKit provider setup
├── public/               # Static assets (images, icons)
├── minikit.config.ts     # Farcaster Mini App config
├── package.json          # Dependencies
└── README.md            # You are here!
```

---

## 🎯 Roadmap

- [x] Twitch stream integration
- [x] USDC tipping on Base Sepolia
- [x] Wallet connection (OnchainKit)
- [x] Activity feed & profile stats
- [x] Popular categories discovery
- [ ] Mainnet launch (Base L2)
- [ ] Multi-platform support (YouTube, Kick)
- [ ] Leaderboards & achievements

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


---

## 🙏 Acknowledgments

Built with ❤️ by the WaveTip team

Special thanks to:
- **Base** — For providing an excellent L2 platform
- **Coinbase** — For OnchainKit and Smart Wallet
- **Farcaster** — For the Mini App 
- **Twitch** — For the embed API
- **The crypto community** — For endless inspiration

---

<p align="center">
  <strong>WaveTip</strong> bridges content creation and crypto in real-time — for a future where value flows as easily as conversation. 🚀
</p>

<p align="center">
  <img src="https://img.shields.io/badge/base-sepolia-0052FF?style=for-the-badge&logo=ethereum" />
  <img src="https://img.shields.io/badge/usdc-stablecoin-2775CA?style=for-the-badge&logo=circle" />
  <img src="https://img.shields.io/badge/farcaster-mini_app-8A63D2?style=for-the-badge" />

</p>

<p align="center">
  <sub>Made with 💙 for the streaming community</sub>
</p>
