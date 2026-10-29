<!-- GENERATED FILE — do not edit by hand. Edit tokenomics.json / templates/README.template.md, then run: python3 scripts/build_readme.py -->

<p align="center">
  <img src="images/fayo_x_header_1500x500.png" alt="FAYO — The Future Is Yours" width="100%">
</p>

# 🌌 {{project.name}} Token

Welcome to the official repository of **{{project.name}} ({{project.ticker}})** — *{{project.acronym}}*, built on **Solana**.

{{project.name}} is a community token built around the future of AI and digital ownership.
It does not promise returns or the “next generation” of anything — it is a community token with a fixed supply, revoked authorities, immutable metadata, and a fully public creation process.

> **{{project.tagline}}.**

---

## 🧠 Core Principles

- ✅ **Fixed supply** — Mint authority revoked, no new tokens can ever be minted
- ✅ **No freeze authority** — Tokens cannot be frozen
- ✅ **Immutable metadata** — Permanently locked on-chain
- ✅ **Open token source** — The exact scripts used to create the token are in [`token/`](token/)
- 🕓 **Transparent vesting** — Vesting contracts will be published publicly (TBA)

---

## 📜 Overview

| Parameter | Value |
|------------|--------|
| **Name** | {{project.name}} — {{project.acronym}} |
| **Blockchain** | {{token.blockchain}} |
| **Token Standard** | {{token.standard}} |
| **Ticker** | {{project.ticker}} |
| **Decimals** | {{token.decimals}} |
| **Total Supply** | {{total_supply_fmt}} {{project.ticker}} |
| **Contract (Mint)** | [`{{token.mint}}`]({{solscan_token}}) |
| **Mint Authority** | ❌ Revoked |
| **Freeze Authority** | ❌ Revoked |
| **Metadata** | 🔒 Immutable |
| **Created** | {{token.created}} |
| **SNS ID** | {{tba.sns}} |
| **Website** | [{{website_host}}]({{project.website}}) |

---

## 📊 Token Allocation & Distribution

> ⚠️ **{{allocation_status}}.** The tokenomics below are a draft and are **not final**. Wallet addresses and vesting contracts will be published here once confirmed.

{{allocation_table}}

- 🌐 Vesting Contracts (Streamflow) — {{tba.streamflow_dashboard}}

---

## 🏦 Liquidity Structure

💧 Planned liquidity in {{project.name}} is multi-layered (draft):
- **7% initial** — planned for the launch liquidity pool (DEX and pool: {{tba.liquidity_pool}}).
- **10% reserve** — {{reserve_amount}} {{project.ticker}} planned to be locked, unlocking quarterly over 24 months.
- **3% management wallet** — {{management_amount}} {{project.ticker}} for liquidity balancing and market depth.

- 💧 Liquidity Pool — {{tba.liquidity_pool}}
- 🔒 Liquidity lock / vesting contracts — {{tba.streamflow_dashboard}}

---

## 🪙 Staking

- 7% of total supply is allocated (draft) for staking rewards.
- Planned linear distribution over 24 months.
- Staking platform and contract: **{{tba.staking}}**

---

## 🔒 Security & Transparency

| Category | Status |
|-----------|--------|
| Mint Authority | Revoked ✅ |
| Freeze Authority | Revoked ✅ |
| Metadata | Immutable ✅ |
| Token Creation Source | Public on GitHub ✅ ([`token/`](token/)) |
| Create Transaction | [`{{create_tx_short}}`]({{create_tx_url}}) |
| Revoke Transaction | [`{{revoke_tx_short}}`]({{revoke_tx_url}}) |
| On-chain Metadata | [metadata.json]({{token.metadata_uri}}) ([copy in repo](metadata.json)) |
| RugCheck | [Report]({{rugcheck}}) |
| Audit | {{tba.audit}} |
| SNS | {{tba.sns}} |
| Domain Verification | {{tba.domain_verification}} |
| Website | [{{project.website}}]({{project.website}}) |

You can verify all of the above yourself on [Solscan]({{solscan_token}}), [Solana Explorer]({{explorer_token}}) and [RugCheck]({{rugcheck}}).

---

## 🌍 Official Links

- 🌐 Website — [{{website_host}}]({{project.website}})
- 🐦 X (Twitter) — [x.com/fayo_world]({{project.twitter}})
- 💬 Telegram — [t.me/fayo_world]({{project.telegram}})
- 💻 GitHub — [{{github_path}}]({{project.github_url}})
- 🔎 Solscan — [Token Page]({{solscan_token}})
- 🧭 Solana Explorer — [Token Page]({{explorer_token}})
- 🛡️ RugCheck — [Token Report]({{rugcheck}})
- 💧 Meteora Pool — {{tba.meteora}}
- 💧 Jupiter Swap — {{tba.jupiter}}
- 📈 CoinMarketCap — {{tba.coinmarketcap}}
- 🦎 CoinGecko — {{tba.coingecko}}
- 📄 Project Overview Document — [Whitepaper.pdf](Whitepaper.pdf)

> Always double-check the contract address: **`{{token.mint}}`**

---

## 🛠️ Repository Layout

| Path | Contents |
|------|----------|
| `metadata.json` | Exact JSON served at the on-chain metadata URI |
| `Whitepaper.pdf` | Project Overview Document (generated from `docs/whitepaper.md`) |
| `tokenomics.json` | Single source of truth for the allocation table and project facts |
| `scripts/build_readme.py` | Regenerates `README.md`, `docs/whitepaper.*` and `Whitepaper.pdf` |
| `token/` | The scripts used to create the token (no keys included) — see [`token/CREATION.md`](token/CREATION.md) |
| `images/`, `logo.png` | Brand assets |

---

## ⚠️ Disclaimer

{{project.name}} tokens are intended as an expression of support for the ideas and community of **“{{project.ticker}}”**,
and are **not** investment instruments or securities.

{{project.name}} does not represent ownership, equity, dividends, or revenue rights, and **the FAYO project team** does not guarantee price performance of any kind.
The FAYO project team will never ask holders for private keys, seed phrases, or personal information.
Always verify official information from the channels listed above.

---
