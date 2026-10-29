# How the FAYO token was created

This folder contains the exact scripts used to create **FAYO ($FAYO)** on Solana mainnet on **Oct 29, 2026**.
They are published for transparency. **No private keys, keypair files, or state files are included.**

| Step | Script | What it did on-chain |
|---|---|---|
| 1 | `src/1-upload.js` | Uploaded the logo (`assets/fayo_icon_512.png`) and the metadata JSON to Irys/Arweave |
| 2 | `src/2-create.js` | Created the classic SPL mint (decimals 9) + Metaplex metadata (`isMutable = false`) and minted 10,000,000,000 FAYO in one atomic transaction |
| 3 | `src/3-revoke.js` | Set mint authority and freeze authority to `null` (irreversible) |
| 4 | `src/4-verify.js` | Read-only check of supply, decimals, authorities and metadata |

## Results (verify them yourself)

- **Mint:** [`91fqZNfSU7w12ym6DcwchXRjaqrmezgrCxGFNmvqbzHb`](https://solscan.io/token/91fqZNfSU7w12ym6DcwchXRjaqrmezgrCxGFNmvqbzHb)
- **Create tx:** [`5DRn7spAj2X3Z1BY2TQqBvnqANNkqoBZYcR85AiUkz4C7YLnspe2vj1v3cwjNtZr7cBZKmdXde6ZjoC9g7zBkvxj`](https://solscan.io/tx/5DRn7spAj2X3Z1BY2TQqBvnqANNkqoBZYcR85AiUkz4C7YLnspe2vj1v3cwjNtZr7cBZKmdXde6ZjoC9g7zBkvxj)
- **Revoke tx:** [`5BCFrdLnKbW4MjHoxG9SWi9XaChQ7tKXfKz3Trn7gkwp15Ppw4EWxZaiE6461M6wYYYtgofsswNVKghr7ETNQUuE`](https://solscan.io/tx/5BCFrdLnKbW4MjHoxG9SWi9XaChQ7tKXfKz3Trn7gkwp15Ppw4EWxZaiE6461M6wYYYtgofsswNVKghr7ETNQUuE)
- **Metadata URI:** https://gateway.irys.xyz/J2QhzSXcvzB2UcQoPYvvuAi6Ui3wxuhvLBEdWEsy4k6p (copy: [`../metadata.json`](../metadata.json))
- **Image URI:** https://gateway.irys.xyz/HxRGabpU7KAr1b45wNvv9j1AhbeRLB1fB6NTWtMzdinp

Quick independent check with the Solana CLI or any RPC:

```bash
solana account 91fqZNfSU7w12ym6DcwchXRjaqrmezgrCxGFNmvqbzHb --url mainnet-beta
# or
curl -s https://api.mainnet-beta.solana.com -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getAccountInfo","params":["91fqZNfSU7w12ym6DcwchXRjaqrmezgrCxGFNmvqbzHb",{"encoding":"jsonParsed"}]}'
# expect: decimals 9, supply 10000000000000000000, mintAuthority null, freezeAuthority null
```

Or run the read-only verifier from this folder (it needs a path to any Solana keypair file to start, but sends no transactions):

```bash
npm ci
node src/4-verify.js --mint=91fqZNfSU7w12ym6DcwchXRjaqrmezgrCxGFNmvqbzHb --keypair ~/.config/solana/id.json
```

The original step-by-step instructions are in [`README.md`](README.md).
