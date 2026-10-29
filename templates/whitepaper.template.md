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
| Mint Address | <code>{{token.mint}}</code> |
| Metadata URI | <a href="{{token.metadata_uri}}">{{token.metadata_uri}}</a> |

## 3. Liquidity & Trading

At the time of writing, **no official liquidity pool has been announced**.

- **Primary pool:** {{tba.liquidity_pool}}
- **DEX / aggregator routing:** {{tba.jupiter}}

The official pool address will be published only through the official channels listed in Section 8 and in the GitHub repository. Any pool or "presale" not announced there should be treated as unofficial.

## 4. Token Distribution <span class="draft">Draft — subject to final confirmation</span>

The allocation below is a **draft** and is **not final**. Wallet addresses and vesting contracts are **TBA** and will be published once confirmed.

{{wp_allocation_table}}

## 5. Vesting

- Locked allocations are planned to be vested through publicly viewable on-chain vesting contracts (e.g. Streamflow). Contract links: **{{tba.streamflow_dashboard}}**.
- Team allocations (Creator & FAYO Team 1–3) are planned with **no cliff** and linear **24-month** unlocks (monthly or quarterly as shown above).
- Advertisement, Developments and Service Provider allocations are planned with **12-month** monthly unlocks.
- Only the initial liquidity (7%) and the liquidity management wallet (3%) are planned to be unlocked at launch.

## 6. Decentralization & Security

- Mint authority revoked — no additional minting is possible
- Freeze authority revoked — no wallet can be frozen
- Metadata immutable — name, symbol and image can never be changed
- Classic SPL Token program — no transfer hooks, fees, or upgradeable custom logic
- Audit: **{{tba.audit}}**

**On-chain proof:**

- Create transaction: <a href="{{create_tx_url}}"><code>{{create_tx_short}}</code></a>
- Revoke transaction: <a href="{{revoke_tx_url}}"><code>{{revoke_tx_short}}</code></a>
- RugCheck: <a href="{{rugcheck}}">{{rugcheck}}</a>

## 7. Roadmap

The roadmap is directional. It contains **no dates and no financial promises** — value is defined by the market.

<div class="phase"><b>Phase 1 — Foundation</b><br>
✔ Token created on Solana · ✔ Mint &amp; freeze authorities revoked · ✔ Immutable metadata · ✔ Website and official channels · ✔ Public GitHub repository with token-creation source</div>
<div class="phase"><b>Phase 2 — Launch</b><br>
Finalize tokenomics · Publish wallet addresses and vesting contracts · Open the official liquidity pool</div>
<div class="phase"><b>Phase 3 — Growth</b><br>
Community building and campaigns · Applications to market data trackers · Independent audit (planned)</div>
<div class="phase"><b>Phase 4 — Ecosystem</b><br>
Staking program · Community initiatives around AI and digital ownership</div>

## 8. Official Links

| Platform | URL |
|---|---|
| Website | <a href="{{project.website}}">{{project.website}}</a> |
| X (Twitter) | <a href="{{project.twitter}}">{{project.twitter}}</a> |
| Telegram | <a href="{{project.telegram}}">{{project.telegram}}</a> |
| GitHub | <a href="{{project.github_url}}">{{project.github_url}}</a> |
| Solscan | <a href="{{solscan_token}}">solscan.io/token/{{mint_short}}</a> |
| Solana Explorer | <a href="{{explorer_token}}">explorer.solana.com/address/{{mint_short}}</a> |
| RugCheck | <a href="{{rugcheck}}">rugcheck.xyz/tokens/{{mint_short}}</a> |

## 9. Legal Disclaimer

{{project.name}} is **not** a financial product or an investment.
It does not represent ownership, equity, dividends, revenue sharing, or any guarantee of return or price performance.
Participation is voluntary and at your own risk. The FAYO project team will never ask for private keys or seed phrases.
Nothing in this document is financial, legal, or tax advice. Always verify the contract address <code>{{token.mint}}</code> through the official channels above.
