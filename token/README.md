# FAYO token: classic SPL token + immutable Metaplex metadata

Four separate steps. Every step is a **dry run unless you pass `--execute`**. On mainnet it then asks you to type `MAINNET` before it sends anything.
Progress is saved in `state.<cluster>.json`, so you can re-run any step safely:
- Step 1 never re-uploads anything already in the state file.
- Step 2 refuses to create a second mint.
- Step 3 skips authorities that are already revoked.

| | |
|---|---|
| Token | name `FAYO`, symbol `FAYO`, decimals 9, supply 10,000,000,000 (10^19 base units) minted to the creator's ATA |
| Program | classic SPL Token (`Tokenkeg…`), Metaplex Token Metadata `createV1+mintV1` (`createAndMint`), TokenStandard.Fungible |
| Metadata | `isMutable=false`, sellerFeeBasisPoints 0, uri = Irys/Arweave JSON (logo `assets/fayo_icon_512.png`) |
| After | mint authority **null**, freeze authority **null** |

## Setup (Ubuntu / WSL)
```bash
cd ~/fayo/fayo_token        # wherever you unpacked it
node -v                     # need >= 20
npm ci                      # installs the exact pinned versions from package-lock.json
```
Defaults: `RPC_URL=https://api.mainnet-beta.solana.com`, `KEYPAIR=~/fayo/creator.json`.
You can override them with env vars or with `--rpc <url> --keypair <path>`.
A private RPC (for example a free Helius or QuickNode mainnet URL) is more reliable than the public one: `export RPC_URL=...`.

The cluster is detected from the RPC's genesis hash, not from the URL. The devnet Irys node is refused on mainnet, and the mainnet Irys node is refused on devnet.

## Mainnet run
```bash
solana balance -k ~/fayo/creator.json -u mainnet-beta      # want >= 0.05 SOL (needs ~0.019)
node tools/estimate-cost.js                                 # read-only price check

node src/1-upload.js                 # dry run: shows sizes + Irys price
node src/1-upload.js --execute       # uploads logo + JSON -> prints IMAGE_URI / METADATA_URI
                                     # open both URLs in a browser and check them

node src/2-create.js                 # dry run: shows new mint address + cost
node src/2-create.js --execute       # creates mint + metadata + mints 10B FAYO (one atomic tx)

node src/3-revoke.js                 # dry run
node src/3-revoke.js --execute       # sets mint + freeze authority to null (irreversible)

node src/4-verify.js                 # read-only, exit code 0 only if every check passes
```
Keep `state.mainnet-beta.json` (it holds the mint address and URIs). `mint-keypair.mainnet-beta.json` is only needed until step 2 has succeeded.

## Measured costs (test validator running the Token Metadata program dumped from devnet; Irys devnet)
- Step 1: Irys mainnet price for the 453,437-byte PNG is ~0.000013 SOL. JSON files ≤100 KiB are free. The script funds the price +20%, plus about 0.00001 SOL in tx fees.
- Step 2: **0.01864148 SOL** in total:
  - mint rent 0.0014616
  - metadata rent 0.0051156
  - **Metaplex create fee 0.01**
  - ATA rent 0.00203928
  - tx fee 0.000025
- Step 3: 0.00001 SOL
- **Total ≈ 0.0187 SOL**

## RugCheck notes
- This covers mint authority, freeze authority, and mutable metadata.
- RugCheck will still warn while the creator holds 100% of supply and there is no liquidity. Those warnings clear once you add an LP and burn or lock the LP tokens.
- `updateAuthority` stays the creator wallet. That doesn't matter because `isMutable=false` means nobody can ever change the metadata.
