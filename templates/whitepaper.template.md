<div class="cover">
  <img class="cover-logo" src="../images/fayo_logo_full_1024.png" alt="FAYO logo">
  <h1 class="cover-title">{{project.name}} ({{project.symbol}})</h1>
  <p class="cover-sub">Project Overview Document</p>
  <p class="cover-tag">{{project.acronym}} · {{project.tagline}}</p>
  <table class="facts">
    <tr><th>Network</th><td>Solana (SPL Token)</td></tr>
    <tr><th>Total Supply</th><td>{{total_supply_fmt}} {{project.symbol}}</td></tr>
    <tr><th>Contract</th><td><code>{{token.mint}}</code></td></tr>
    <tr><th>Website</th><td><a href="{{project.website}}">{{project.website}}</a></td></tr>
    <tr><th>Staking</th><td><a href="{{staking.stake_pool_url}}">Streamflow stake pool {{stake_pool_short}}</a></td></tr>
    <tr><th>Explorer</th><td><a href="{{solscan_token}}">solscan.io/token/{{mint_short}}</a></td></tr>
  </table>
  <p class="cover-date">Document version {{doc_version}} · Generated {{build_date}}</p>
</div>

## 1. Introduction

**{{project.name}}** — *{{project.acronym}}* — is a community token on the Solana blockchain built around the future of AI and digital ownership.

The token was created with **no mint authority, no freeze authority, and immutable metadata**, which makes its supply structure fixed, trustless, and irreversible. The exact scripts used to create it are published in the project's public GitHub repository.

{{project.name}} does not represent ownership, revenue rights, or investment guarantees. It is a freely transferable community token within the Solana ecosystem.

> *{{project.tagline}}.*

## 2. Token Characteristics

| Attribute | Value |
|---|---|
| Token Standard | {{token.standard}} |
| Name / Symbol | {{project.name}} / {{project.symbol}} |
| Total Supply | {{total_supply_fmt}} {{project.symbol}} (fixed) |
| Decimal Precision | {{token.decimals}} |
| Mint Authority | Revoked permanently |
| Freeze Authority | Revoked permanently |
| Metadata | Immutable (Metaplex Token Metadata, <code>isMutable = false</code>) |
| Created | {{token.created}} |
| Creator Wallet | <code>{{token.creator_wallet}}</code> |
| Mint Address | <code>{{token.mint}}</code> |
| Metadata URI | <a href="{{token.metadata_uri}}">{{token.metadata_uri}}</a> |

## 3. Liquidity & Trading

The Meteora liquidity pool has **not been created yet**.

- **Primary pool (Meteora):** {{links.meteora}}
- **DEX / aggregator routing (Jupiter):** {{links.jupiter}}
- **Initial Liquidity wallet (10%, unlocked):** <a href="https://solscan.io/account/21jP79P297pg91xgpu3SSvNFhX4bASyZtwdoNS3GhHEw"><code>21jP79P297pg91xgpu3SSvNFhX4bASyZtwdoNS3GhHEw</code></a>
- **Liquidity Management wallet (4.5%, unlocked emergency reserve):** <a href="https://solscan.io/account/JBMoTF7h4HRhagXWmNnGiVeMN7Wsedne4zVsvPwCM1ew"><code>JBMoTF7h4HRhagXWmNnGiVeMN7Wsedne4zVsvPwCM1ew</code></a>
- **Liquidity Reserve (10%)** is locked in a Streamflow contract and unlocks monthly over 12 months.

The official pool address will be published only through the official channels listed in Section 9 and in the GitHub repository. Any pool or "presale" not announced there should be treated as unofficial.

## 4. Token Distribution <span class="final">Final</span>

The allocation below is **final** and live on Solana mainnet. Every wallet, vesting contract and transaction is linked and can be verified on Solscan and Streamflow.

{{wp_allocation_table}}

<small>{{vesting.fee_note}}</small>

**Full addresses:**

{{wp_address_table}}

## 5. Vesting

- All locked allocations are held in **8 Streamflow vesting contracts** that are **non-cancelable** and **non-transferable**.
- Vesting started **{{vesting.start}}** with **no cliff** and linear {{vesting.unlock_period}} unlocks.
- **Creator (20%)** vests over **24 months**.
- **Exchange Listings (16%), Liquidity Reserve (10%), Advertising &amp; Marketing (10%), Airdrop (10%), Support &amp; Development Team (10%) and Services &amp; Providers (1%)** vest over **12 months**.
- **Advertiser (0.5%)** vests over **12 months**, starting Nov 3, 2026 (funded from Liquidity Management).
- Only **Initial Liquidity (10%)** and **Liquidity Management (4.5%)** are unlocked. **Staking Rewards (8%)** are locked in the Streamflow staking reward pool.

## 6. Staking

{{project.name}} staking runs on **{{staking.platform}}** (created {{staking.created}}).

| Parameter | Value |
|---|---|
| Stake pool | <a href="{{staking.stake_pool_url}}"><code>{{staking.stake_pool}}</code></a> |
| Reward pool | <a href="{{reward_pool_url}}"><code>{{staking.reward_pool}}</code></a> ({{staking.reward_type}}) |
| Reward fund | {{reward_fund_fmt}} {{project.symbol}} (finite) |
| Lock period | {{staking.lock}} |
| Weight | {{staking.weight}} |
| Reward rate | {{staking.reward_rate}} |
| Cap / expiry | {{staking.cap}} · {{staking.expiry}} |
| Transactions | <a href="{{staking_create_pool_tx_url}}">Create pool</a> · <a href="{{staking_create_reward_pool_tx_url}}">Create reward pool</a> · <a href="{{staking_fund_tx_url}}">Fund reward pool</a> |

At the fixed rate this is roughly **{{rate_6m_pct}} in total for a 6-month lock (1x weight)** and roughly **{{rate_12m_pct}} annualized for a 12-month lock (2x weight)**, *only while the reward fund lasts*.

Rewards are paid from a **finite fund**. When it is exhausted, rewards **stop**. The reward rate is a mechanical parameter of the pool, **not a promise of returns**, and nothing about the price or value of {{project.symbol}} is guaranteed.

## 7. Decentralization & Security

- Mint authority revoked — no additional minting is possible
- Freeze authority revoked — no wallet can be frozen
- Metadata immutable — name, symbol and image can never be changed
- Classic SPL Token program — no transfer hooks, fees, or upgradeable custom logic
- Audit: **{{links.audit}}**

**On-chain proof:**

- Create transaction: <a href="{{create_tx_url}}"><code>{{create_tx_short}}</code></a>
- Revoke transaction: <a href="{{revoke_tx_url}}"><code>{{revoke_tx_short}}</code></a>
- RugCheck: <a href="{{rugcheck}}">{{rugcheck}}</a>

## 8. Roadmap

The roadmap is directional. It contains **no dates and no financial promises** — value is defined by the market.

<div class="phase"><b>Phase 1 — Foundation</b><br>
✔ Token created on Solana · ✔ Mint &amp; freeze authorities revoked · ✔ Immutable metadata · ✔ Website and official channels · ✔ Public GitHub repository with token-creation source</div>
<div class="phase"><b>Phase 2 — Launch</b><br>
✔ Final tokenomics · ✔ Wallets funded and published · ✔ 8 Streamflow vesting contracts · ✔ Streamflow staking pool · Open the official Meteora liquidity pool (coming soon)</div>
<div class="phase"><b>Phase 3 — Growth</b><br>
Community building and campaigns · Applications to market data trackers · Independent audit (planned)</div>
<div class="phase"><b>Phase 4 — Ecosystem</b><br>
Community initiatives around AI and digital ownership</div>

## 9. Official Links

| Platform | URL |
|---|---|
| Website | <a href="{{project.website}}">{{project.website}}</a> |
| X (Twitter) | <a href="{{project.twitter}}">{{project.twitter}}</a> |
| Telegram | <a href="{{project.telegram}}">{{project.telegram}}</a> |
| GitHub | <a href="{{project.github_url}}">{{project.github_url}}</a> |
| Solscan | <a href="{{solscan_token}}">solscan.io/token/{{mint_short}}</a> |
| Solana Explorer | <a href="{{explorer_token}}">explorer.solana.com/address/{{mint_short}}</a> |
| Staking | <a href="{{staking.stake_pool_url}}">Streamflow stake pool</a> |
| RugCheck | <a href="{{rugcheck}}">rugcheck.xyz/tokens/{{mint_short}}</a> |

## 10. Legal Disclaimer

{{project.name}} is **not** a financial product or an investment.
It does not represent ownership, equity, dividends, revenue sharing, or any guarantee of return or price performance.
Participation is voluntary and at your own risk. The FAYO project team will never ask for private keys or seed phrases.
Nothing in this document is financial, legal, or tax advice. Always verify the contract address <code>{{token.mint}}</code> through the official channels above.
