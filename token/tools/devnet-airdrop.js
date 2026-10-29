// DEVNET/TESTNET ONLY helper: create a throwaway keypair (if missing) and request airdrops.
// Usage: RPC_URL=<devnet rpc> node tools/devnet-airdrop.js <keypair.json> [solAmount]
import fs from 'node:fs';
import { Keypair, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
const [file, amt = '2'] = process.argv.slice(2);
const rpc = process.env.RPC_URL || 'https://api.devnet.solana.com';
const conn = new Connection(rpc, 'confirmed');
const g = await conn.getGenesisHash();
if (g === '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d') throw new Error('Refusing to run against mainnet');
let kp;
if (fs.existsSync(file)) kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(file, 'utf8'))));
else { kp = Keypair.generate(); fs.writeFileSync(file, JSON.stringify(Array.from(kp.secretKey)), { mode: 0o600 }); }
console.log('address', kp.publicKey.toBase58());
for (let i = 0; i < 6; i++) {
  try {
    const sig = await conn.requestAirdrop(kp.publicKey, Number(amt) * LAMPORTS_PER_SOL);
    await conn.confirmTransaction(sig, 'confirmed');
    console.log('airdrop ok', sig); break;
  } catch (e) { console.log('airdrop failed:', e.message.slice(0, 200)); await new Promise(r => setTimeout(r, 4000 * (i + 1))); }
}
console.log('balance', (await conn.getBalance(kp.publicKey)) / LAMPORTS_PER_SOL, 'SOL');
