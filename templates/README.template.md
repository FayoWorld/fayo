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
- 🔐 **Transparent vesting** — 7 non-cancelable, non-transferable [Streamflow](https://app.streamflow.finance) vesting contracts, all linked below
- 🪙 **On-chain staking** — Public [Streamflow staking pool]({{staking.stake_pool_url}}) funded with {{reward_fund_fmt}} {{project.ticker}}

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
| **Creator Wallet** | [`{{token.creator_wallet}}`]({{creator_wallet_url}}) |
| **Liquidity Pool** | {{links.liquidity_pool}} |
| **Staking** | [Streamflow Stake Pool]({{staking.stake_pool_url}}) |
| **SNS ID** | {{links.sns}} |
| **Website** | [{{website_host}}]({{project.website}}) |

---

## 📊 Token Allocation & Distribution

> ✅ **{{allocation_status}}.** Every address and transaction below can be verified on Solscan and Streamflow.

{{allocation_table}}

**Vesting terms (all 8 Streamflow contracts):** started {{vesting.start}}, linear {{vesting.unlock_period}} unlocks, no cliff, cancelable: **{{vesting.cancelable}}**, transferable: **{{vesting.transferable}}**.

> ℹ️ {{vesting.fee_note}}

### 🔗 On-chain Proof (wallets, contracts, transactions)

{{proof_table}}

---

## 🏦 Liquidity Structure

💧 Liquidity in {{project.name}} is multi-layered:
- **10% Initial Liquidity** — 1,000,000,000 {{project.ticker}}, unlocked, held for the future Meteora liquidity pool.
- **4.5% Liquidity Management** — 449,905,000 {{project.ticker}}, unlocked emergency reserve for pool management (0.5% was moved to the Advertiser vesting contract on Nov 3, 2026).
- **10% Liquidity Reserve** — 1,000,000,000 {{project.ticker}}, locked in Streamflow and unlocking monthly over 12 months.

- 💧 Meteora Liquidity Pool — {{links.meteora}}

The official pool address will be published only in this repository and the official channels below. Any pool not announced there should be treated as unofficial.

---

## 🪙 Staking

{{project.name}} staking runs on **{{staking.platform}}** (created {{staking.created}}).

| Parameter | Value |
|-----------|-------|
| **Stake Pool** | [`{{staking.stake_pool}}`]({{staking.stake_pool_url}}) |
| **Reward Pool** | [`{{staking.reward_pool}}`]({{reward_pool_url}}) ({{staking.reward_type}}) |
| **Reward Fund** | {{reward_fund_fmt}} {{project.ticker}} (finite) |
| **Lock Period** | {{staking.lock}} |
| **Weight** | {{staking.weight}} |
| **Reward Rate** | {{staking.reward_rate}} |
| **Cap / Expiry** | {{staking.cap}} · {{staking.expiry}} |
| **Create Pool Tx** | [`{{staking_create_pool_tx_short}}`]({{staking_create_pool_tx_url}}) |
| **Create Reward Pool Tx** | [`{{staking_create_reward_pool_tx_short}}`]({{staking_create_reward_pool_tx_url}}) |
| **Fund Reward Pool Tx** | [`{{staking_fund_tx_short}}`]({{staking_fund_tx_url}}) |

At the fixed rate this works out to roughly **{{rate_6m_pct}} in total for a 6-month lock (1x)** and roughly **{{rate_12m_pct}} annualized for a 12-month lock (2x)**, *while the reward fund lasts*.

> ⚠️ Rewards are paid from a **finite fund** of {{reward_fund_fmt}} {{project.ticker}}. When the fund is exhausted, rewards **stop**. The reward rate is not a promise of returns, and nothing about price or value is guaranteed. Staked tokens stay locked for the period you choose.

👉 [Stake FAYO on Streamflow]({{staking.stake_pool_url}})

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
| Vesting Contracts | 7 × Streamflow, non-cancelable ✅ |
| Audit | {{links.audit}} |
| SNS | {{links.sns}} |
| Domain Verification | {{links.domain_verification}} |
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
- 🪙 Staking — [Streamflow Stake Pool]({{staking.stake_pool_url}})
- 💧 Meteora Pool — {{links.meteora}}
- 💧 Jupiter Swap — {{links.jupiter}}
- 📈 CoinMarketCap — {{links.coinmarketcap}}
- 🦎 CoinGecko — {{links.coingecko}}
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
