// STEP 1: upload logo + metadata JSON permanently to Arweave via Irys. Saves URIs to the state file.
// Idempotent: anything already recorded in the state file is not uploaded again.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { setup, loadState, saveState, solBalance, fmtSol, confirm, buildMetadataJson, fetchWithRetry, expandHome, PROJECT_DIR, sleep } from './common.js';

const ctx = await setup({ needUploader: true });
const { irys } = ctx;
const state = loadState(ctx.statePath);
if (state.cluster && state.cluster !== ctx.cluster) throw new Error(`State file is for ${state.cluster}, RPC is ${ctx.cluster}`);
const GATEWAY = 'https://gateway.irys.xyz/';
const FREE_BYTES = 100 * 1024; // Irys uploads <=100 KiB are currently free (no funding needed)

const logoPath = path.resolve(expandHome(ctx.args.logo || process.env.LOGO || path.join(PROJECT_DIR, 'assets', 'fayo_icon_512.png')));
const logo = fs.readFileSync(logoPath);
if (logo.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${logoPath} is not a PNG`);
const w = logo.readUInt32BE(16), h = logo.readUInt32BE(20);
if (w !== h) throw new Error(`Logo must be square, got ${w}x${h}`);
const logoSha = crypto.createHash('sha256').update(logo).digest('hex');
console.log(`Logo         : ${logoPath}  ${w}x${h}  ${logo.length} bytes  sha256 ${logoSha.slice(0, 16)}…`);
if (state.imageUri && state.logoSha256 && state.logoSha256 !== logoSha) {
  throw new Error(`State already has an image uploaded from a different file (sha ${state.logoSha256}). Use a new --state file to re-upload.`);
}

const jsonBytesFor = (img) => Buffer.from(JSON.stringify(buildMetadataJson(img)));
const jsonEstimate = jsonBytesFor(state.imageUri || GATEWAY + 'X'.repeat(44));

const before = await solBalance(ctx);
console.log(`SOL balance  : ${fmtSol(before)}`);
if (state.imageUri && state.metadataUri) {
  console.log(`\nAlready uploaded (nothing to do):\n  image: ${state.imageUri}\n  json : ${state.metadataUri}`);
  process.exit(0);
}

const files = [];
if (!state.imageUri) files.push(['image', logo.length]);
if (!state.metadataUri) files.push(['metadata json', jsonEstimate.length]);
let totalPrice = 0n;
for (const [label, bytes] of files) {
  const p = BigInt((await irys.getPrice(bytes)).toFixed(0));
  totalPrice += p;
  console.log(`Irys price   : ${label.padEnd(14)} ${String(bytes).padStart(8)} B -> ${fmtSol(p)}${bytes <= FREE_BYTES ? '  (≤100 KiB: normally free)' : ''}`);
}
const irysBal = BigInt((await irys.getBalance()).toFixed(0));
console.log(`Irys balance : ${fmtSol(irysBal)} (prepaid credit for this wallet on ${ctx.irysUrl})`);
console.log(`Estimated cost of this step: ≤ ${fmtSol((totalPrice * 12n) / 10n + 10_000n)} (Irys price +20% buffer + funding tx fee)`);

if (!(await confirm(ctx, `About to upload ${files.length} file(s) to ${ctx.irysUrl} (${ctx.cluster.toUpperCase()}). Permanent on mainnet.`))) process.exit(0);

async function ensureFunded(bytes) {
  const price = BigInt((await irys.getPrice(bytes)).toFixed(0));
  const bal = BigInt((await irys.getBalance()).toFixed(0));
  if (bal >= price) return;
  const amount = (price * 12n) / 10n - bal; // +20% buffer against price moves
  console.log(`  funding Irys with ${fmtSol(amount)} …`);
  const r = await irys.fund(amount.toString());
  console.log(`  funded: tx ${r.id}`);
  for (let i = 0; i < 20 && BigInt((await irys.getBalance()).toFixed(0)) < price; i++) await sleep(3000);
}

async function uploadBuffer(buf, contentType) {
  const tags = [{ name: 'Content-Type', value: contentType }, { name: 'App-Name', value: 'fayo-token' }];
  if (buf.length > FREE_BYTES) await ensureFunded(buf.length);
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await irys.upload(buf, { tags });
      return GATEWAY + r.id;
    } catch (e) {
      const msg = String(e?.message || e);
      if (attempt >= 3) throw e;
      console.log(`  upload attempt ${attempt} failed: ${msg.slice(0, 160)}`);
      if (/402|balance|fund/i.test(msg)) await ensureFunded(buf.length);
      else await sleep(3000 * attempt);
    }
  }
}

if (!state.imageUri) {
  console.log('\nUploading image…');
  state.imageUri = await uploadBuffer(logo, 'image/png');
  state.logoSha256 = logoSha;
  state.logoPath = logoPath;
  state.cluster = ctx.cluster;
  saveState(ctx.statePath, state);
  console.log(`  image: ${state.imageUri}`);
}
if (!state.metadataUri) {
  const json = buildMetadataJson(state.imageUri);
  console.log('Uploading metadata JSON…');
  state.metadataUri = await uploadBuffer(Buffer.from(JSON.stringify(json)), 'application/json');
  state.metadataJson = json;
  state.cluster = ctx.cluster;
  saveState(ctx.statePath, state);
  console.log(`  json : ${state.metadataUri}`);
}

console.log('\nChecking that URIs are reachable…');
const ir = await fetchWithRetry(state.imageUri);
console.log(`  image: HTTP ${ir.status} ${ir.headers.get('content-type')} ${(await ir.arrayBuffer()).byteLength} B`);
const jr = await fetchWithRetry(state.metadataUri);
const fetched = await jr.json();
console.log(`  json : HTTP ${jr.status} ${jr.headers.get('content-type')} name=${fetched.name} image=${fetched.image}`);

const after = await solBalance(ctx);
state.costs = { ...(state.costs || {}), step1_upload_lamports: (before - after).toString() };
saveState(ctx.statePath, state);
console.log(`\nSOL balance  : ${fmtSol(before)} -> ${fmtSol(after)}   (spent ${fmtSol(before - after)})`);
console.log(`Irys balance left: ${fmtSol(BigInt((await irys.getBalance()).toFixed(0)))}`);
console.log(`\nSTEP 1 DONE.\n  IMAGE_URI=${state.imageUri}\n  METADATA_URI=${state.metadataUri}`);
if (ctx.cluster === 'mainnet-beta') console.log(`  (also on Arweave: https://arweave.net/${state.metadataUri.split('/').pop()} once the bundle settles)`);
