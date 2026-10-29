// Shared helpers for the FAYO token scripts.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { mplToolbox, setComputeUnitPrice, setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { Uploader } from '@irys/upload';
import Solana from '@irys/upload-solana';
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi';

export const PROJECT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- token spec
export const TOKEN = {
  name: 'FAYO',
  symbol: 'FAYO',
  decimals: 9,
  // 10,000,000,000 tokens * 10^9 base units
  supplyBaseUnits: 10_000_000_000n * 10n ** 9n,
  description:
    'FAYO — Future Assets You Own. A community token on Solana built around the future of AI and digital ownership. The Future Is Yours.',
  website: 'https://fayo.world',
  twitter: 'https://x.com/fayo_world',
  telegram: 'https://t.me/fayo_world',
};

export function buildMetadataJson(imageUri) {
  return {
    name: TOKEN.name,
    symbol: TOKEN.symbol,
    description: TOKEN.description,
    image: imageUri,
    external_url: TOKEN.website,
    website: TOKEN.website,
    twitter: TOKEN.twitter,
    telegram: TOKEN.telegram,
    extensions: { website: TOKEN.website, twitter: TOKEN.twitter, telegram: TOKEN.telegram },
    properties: { files: [{ uri: imageUri, type: 'image/png' }], category: 'image' },
  };
}

// ---------------------------------------------------------------- args / env
const GENESIS = {
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d': 'mainnet-beta',
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG: 'devnet',
  '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY': 'testnet',
};

export function parseArgs(argv = process.argv.slice(2)) {
  const args = { flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const [k, v] = a.slice(2).split('=');
    if (v !== undefined) args[k] = v;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--') && ['rpc', 'keypair', 'state', 'logo', 'irys', 'priority-fee'].includes(k)) args[k] = argv[++i];
    else args.flags.add(k);
  }
  return args;
}

export function expandHome(p) {
  return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
}

export async function setup({ needUploader = false } = {}) {
  const args = parseArgs();
  const rpcUrl = args.rpc || process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
  const keypairPath = path.resolve(expandHome(args.keypair || process.env.KEYPAIR || '~/fayo/creator.json'));
  const execute = args.flags.has('execute');
  const yes = args.flags.has('yes');
  const priorityMicroLamports = Number(args['priority-fee'] ?? process.env.PRIORITY_FEE_MICROLAMPORTS ?? 50_000);

  // Detect cluster from genesis hash (works with any RPC provider URL).
  const genesis = await rpcCall(rpcUrl, 'getGenesisHash', []);
  const isLocal = /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(rpcUrl);
  const cluster = GENESIS[genesis] ?? (isLocal ? 'localnet' : 'unknown');
  if (cluster === 'unknown') throw new Error(`Unknown cluster (genesis ${genesis}) for RPC ${rpcUrl}`);

  const statePath = path.resolve(expandHome(args.state || process.env.STATE_FILE || path.join(PROJECT_DIR, `state.${cluster}.json`)));

  if (!fs.existsSync(keypairPath)) throw new Error(`Keypair file not found: ${keypairPath}`);
  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf8')));

  const umi = createUmi(rpcUrl, 'confirmed').use(mplTokenMetadata()).use(mplToolbox());
  const kp = umi.eddsa.createKeypairFromSecretKey(secret);
  umi.use(keypairIdentity(kp));

  let irysUrl = null;
  if (needUploader) {
    irysUrl = args.irys || process.env.IRYS_URL || (cluster === 'mainnet-beta' ? 'https://uploader.irys.xyz' : 'https://devnet.irys.xyz');
    if (cluster !== 'mainnet-beta' && !irysUrl.includes('devnet')) throw new Error('Refusing: non-mainnet RPC with mainnet Irys node');
    if (cluster === 'mainnet-beta' && irysUrl.includes('devnet')) throw new Error('Refusing: mainnet RPC with devnet Irys node (devnet data expires)');
    if (cluster === 'localnet') throw new Error('Irys cannot be funded from a local validator; run step 1 against devnet or mainnet.');
  }

  const ctx = { umi, args, rpcUrl, cluster, keypairPath, statePath, execute, yes, priorityMicroLamports, irysUrl };
  console.log('================================================================');
  console.log(`Cluster      : ${cluster.toUpperCase()}`);
  console.log(`RPC          : ${rpcUrl}`);
  console.log(`Creator      : ${umi.identity.publicKey}  (${keypairPath})`);
  console.log(`State file   : ${statePath}`);
  if (irysUrl) console.log(`Irys node    : ${irysUrl}`);
  console.log(`Mode         : ${execute ? 'EXECUTE' : 'DRY-RUN (add --execute to send transactions)'}`);
  console.log('================================================================');
  if (needUploader) {
    let b = Uploader(Solana).bundlerUrl(irysUrl).withWallet(secret).withRpc(rpcUrl).withIrysConfig({ timeout: 120_000 });
    if (cluster !== 'mainnet-beta') b = b.devnet();
    ctx.irys = await b.build();
  }
  return ctx;
}

export async function rpcCall(rpcUrl, method, params) {
  let lastErr;
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      const j = await r.json();
      if (j.error) throw new Error(JSON.stringify(j.error));
      return j.result;
    } catch (e) {
      lastErr = e;
      await sleep(1500 * (i + 1));
    }
  }
  throw lastErr;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- state
export function loadState(statePath) {
  return fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
}
export function saveState(statePath, state) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const tmp = statePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n');
  fs.renameSync(tmp, statePath);
}

// ---------------------------------------------------------------- balances
export const LAMPORTS_PER_SOL = 1_000_000_000n;
export const fmtSol = (lamports) => (Number(lamports) / 1e9).toFixed(9) + ' SOL';

export async function solBalance(ctx) {
  const b = await ctx.umi.rpc.getBalance(ctx.umi.identity.publicKey);
  return b.basisPoints;
}

export async function rentExempt(ctx, bytes) {
  return BigInt(await rpcCall(ctx.rpcUrl, 'getMinimumBalanceForRentExemption', [bytes]));
}

// ---------------------------------------------------------------- confirm
export async function confirm(ctx, summary) {
  if (!ctx.execute) {
    console.log('\nDRY-RUN: nothing was sent. Re-run with --execute to perform this step.');
    return false;
  }
  if (ctx.yes && ctx.cluster !== 'mainnet-beta') return true;
  if (ctx.yes && ctx.cluster === 'mainnet-beta' && process.env.FAYO_I_AM_SURE === 'yes') return true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ans = await rl.question(`\n${summary}\nType "${ctx.cluster === 'mainnet-beta' ? 'MAINNET' : 'yes'}" to proceed: `);
  rl.close();
  const ok = ans.trim() === (ctx.cluster === 'mainnet-beta' ? 'MAINNET' : 'yes');
  if (!ok) console.log('Aborted by user.');
  return ok;
}

// ---------------------------------------------------------------- tx helpers
export function withPriority(ctx, builder, units = 300_000) {
  let b = builder.prepend(setComputeUnitLimit(ctx.umi, { units }));
  if (ctx.priorityMicroLamports > 0) b = b.prepend(setComputeUnitPrice(ctx.umi, { microLamports: ctx.priorityMicroLamports }));
  return b;
}

export async function sendTx(ctx, builder, label) {
  const { signature } = await builder.sendAndConfirm(ctx.umi, {
    send: { skipPreflight: false, maxRetries: 5 },
    confirm: { commitment: 'confirmed' },
  });
  const sig = (await import('@metaplex-foundation/umi/serializers')).base58.deserialize(signature)[0];
  console.log(`  ✔ ${label}: ${sig}`);
  console.log(`    ${explorerTx(ctx, sig)}`);
  return sig;
}

const clusterParam = (ctx) =>
  ctx.cluster === 'mainnet-beta' ? '' : ctx.cluster === 'localnet' ? `?cluster=custom&customUrl=${encodeURIComponent(ctx.rpcUrl)}` : `?cluster=${ctx.cluster}`;
export const explorerTx = (ctx, sig) => `https://explorer.solana.com/tx/${sig}${clusterParam(ctx)}`;
export const explorerAddr = (ctx, a) => `https://explorer.solana.com/address/${a}${clusterParam(ctx)}`;
export const solscanToken = (ctx, a) => `https://solscan.io/token/${a}${ctx.cluster === 'mainnet-beta' ? '' : '?cluster=' + ctx.cluster}`;

export async function fetchWithRetry(url, tries = 8) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { redirect: 'follow' });
      if (r.ok) return r;
      last = new Error(`HTTP ${r.status} for ${url}`);
    } catch (e) {
      last = e;
    }
    await sleep(2000 * (i + 1));
  }
  throw last;
}

export { publicKey };
