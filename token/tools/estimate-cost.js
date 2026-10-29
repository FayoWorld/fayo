// Read-only cost estimate. Queries the Irys MAINNET price endpoint (HTTP GET only, no wallet, no RPC).
// Usage: node tools/estimate-cost.js [logo.png]
import fs from 'node:fs';
import { buildMetadataJson } from '../src/common.js';
const logo = process.argv[2] || new URL('../assets/fayo_icon_512.png', import.meta.url).pathname;
const imgBytes = fs.statSync(logo).size;
const jsonBytes = Buffer.from(JSON.stringify(buildMetadataJson('https://gateway.irys.xyz/' + 'X'.repeat(44)))).length;
const price = async (n) => BigInt(await (await fetch(`https://uploader.irys.xyz/price/solana/${n}`)).text());
const pImg = await price(imgBytes), pJson = await price(jsonBytes);
const sol = (l) => (Number(l) / 1e9).toFixed(6);
const fund = (pImg * 12n) / 10n; // step 1 funds image price +20%; JSON (<100 KiB) is free
const step1 = fund + 5000n + 5000n; // + funding tx fee (+ priority margin)
const step2 = 1_461_600n + 5_115_600n + 10_000_000n + 2_039_280n + 20_000n; // measured on test validator
const step3 = 10_000n;
console.log(`Irys mainnet price: image ${imgBytes} B = ${sol(pImg)} SOL, json ${jsonBytes} B = ${sol(pJson)} SOL (json <=100KiB is free)`);
console.log(`Step 1 upload  ≈ ${sol(step1)} SOL (Irys funding incl. 20% buffer + tx fee)`);
console.log(`Step 2 create  ≈ ${sol(step2)} SOL (mint rent 0.0014616 + metadata rent 0.0051156 + Metaplex fee 0.01 + ATA rent 0.00203928 + fees)`);
console.log(`Step 3 revoke  ≈ ${sol(step3)} SOL`);
console.log(`TOTAL          ≈ ${sol(step1 + step2 + step3)} SOL  (keep ≥0.05 SOL in the wallet for headroom)`);
