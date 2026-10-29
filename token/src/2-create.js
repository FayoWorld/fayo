// STEP 2: create the classic SPL mint + Metaplex metadata (immutable) and mint the full supply
// to the creator's associated token account — in ONE atomic transaction.
// Idempotent: refuses to create a second mint if the state file already has one.
import fs from 'node:fs';
import path from 'node:path';
import { generateSigner, createSignerFromKeypair, percentAmount, some } from '@metaplex-foundation/umi';
import { createAndMint, TokenStandard, fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { findAssociatedTokenPda, SPL_TOKEN_PROGRAM_ID } from '@metaplex-foundation/mpl-toolbox';
import {
  setup, loadState, saveState, solBalance, fmtSol, confirm, TOKEN, withPriority, sendTx,
  rentExempt, explorerAddr,
} from './common.js';

const ctx = await setup();
const { umi } = ctx;
const state = loadState(ctx.statePath);

if (state.mint) {
  console.log(`\nREFUSING: state file already records mint ${state.mint}`);
  console.log(`  ${explorerAddr(ctx, state.mint)}`);
  console.log('A second mint will NOT be created. Continue with step 3 / step 4.');
  process.exit(0);
}
if (!state.metadataUri || !state.imageUri) throw new Error('No metadataUri in state file. Run step 1 (upload) first.');
if (state.cluster && state.cluster !== ctx.cluster) throw new Error(`State file is for ${state.cluster}, RPC is ${ctx.cluster}`);

// The mint keypair is generated once and persisted BEFORE sending, so a retry after a
// timeout re-uses the same address and can never create a second token.
const mintKeyPath = path.join(path.dirname(ctx.statePath), `mint-keypair.${ctx.cluster}.json`);
let mint;
if (state.pendingMint) {
  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(mintKeyPath, 'utf8')));
  mint = createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(secret));
  if (mint.publicKey !== state.pendingMint) throw new Error('mint keypair file does not match state.pendingMint');
  const acc = await umi.rpc.getAccount(mint.publicKey);
  if (acc.exists) {
    console.log(`Pending mint ${mint.publicKey} already exists on-chain (previous run landed). Recording it.`);
    const da = await fetchDigitalAsset(umi, mint.publicKey);
    state.mint = mint.publicKey;
    state.metadataPda = da.metadata.publicKey;
    state.ata = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner: umi.identity.publicKey })[0];
    delete state.pendingMint;
    saveState(ctx.statePath, state);
    process.exit(0);
  }
  console.log(`Re-using pending mint keypair ${mint.publicKey} (previous attempt did not land).`);
} else {
  mint = generateSigner(umi);
}

const [ata] = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner: umi.identity.publicKey });

// --- cost estimate
const rentMint = await rentExempt(ctx, 82);
const rentMeta = await rentExempt(ctx, 607); // Metadata account size for createV1 fungible (measured)
const protocolFee = 10_000_000n; // Metaplex Token Metadata create fee 0.01 SOL (measured: stored as extra lamports in the metadata account)
const rentAta = await rentExempt(ctx, 165);
const fees = 2n * 5000n + (200_000n * BigInt(ctx.priorityMicroLamports)) / 1_000_000n;
const estTotal = rentMint + rentMeta + rentAta + protocolFee + fees;
const before = await solBalance(ctx);

console.log(`\nMint address (new)   : ${mint.publicKey}`);
console.log(`Creator ATA          : ${ata}`);
console.log(`Token program        : ${SPL_TOKEN_PROGRAM_ID} (classic SPL Token)`);
console.log(`name/symbol/decimals : ${TOKEN.name} / ${TOKEN.symbol} / ${TOKEN.decimals}`);
console.log(`Supply (base units)  : ${TOKEN.supplyBaseUnits}  (= 10,000,000,000 FAYO)`);
console.log(`Metadata URI         : ${state.metadataUri}`);
console.log(`isMutable            : false   sellerFeeBasisPoints: 0`);
console.log(`\nEstimated cost: mint rent ${fmtSol(rentMint)} + metadata rent ${fmtSol(rentMeta)} + Metaplex fee ${fmtSol(protocolFee)} + ATA rent ${fmtSol(rentAta)} + tx fees ~${fmtSol(fees)}`);
console.log(`              = ~${fmtSol(estTotal)}`);
console.log(`SOL balance   : ${fmtSol(before)}`);
if (before < estTotal + 20_000_000n) console.warn('WARNING: balance looks low for this step (want estimate + 0.02 SOL headroom).');

if (!(await confirm(ctx, `About to CREATE token ${TOKEN.symbol} (${mint.publicKey}) on ${ctx.cluster.toUpperCase()} and mint 10,000,000,000 to ${umi.identity.publicKey}.`))) process.exit(0);

// persist the mint keypair + pending state BEFORE sending
fs.writeFileSync(mintKeyPath, JSON.stringify(Array.from(mint.secretKey)), { mode: 0o600 });
state.pendingMint = mint.publicKey;
state.cluster = ctx.cluster;
saveState(ctx.statePath, state);

const builder = withPriority(
  ctx,
  createAndMint(umi, {
    mint,
    authority: umi.identity,
    name: TOKEN.name,
    symbol: TOKEN.symbol,
    uri: state.metadataUri,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: some(TOKEN.decimals),
    isMutable: false,
    tokenStandard: TokenStandard.Fungible,
    splTokenProgram: SPL_TOKEN_PROGRAM_ID,
    amount: TOKEN.supplyBaseUnits,
    tokenOwner: umi.identity.publicKey,
  }),
  200_000,
);

let sig;
try {
  sig = await sendTx(ctx, builder, 'createAndMint');
} catch (e) {
  console.error('\nTransaction error:', e.message);
  console.error('The mint keypair and pendingMint were saved. Re-run this step: it will detect whether the tx landed and never create a second mint.');
  process.exit(1);
}

const da = await fetchDigitalAsset(umi, mint.publicKey);
state.mint = mint.publicKey;
state.metadataPda = da.metadata.publicKey;
state.ata = ata;
state.createSignature = sig;
delete state.pendingMint;
const after = await solBalance(ctx);
state.costs = { ...(state.costs || {}), step2_create_lamports: (before - after).toString() };
saveState(ctx.statePath, state);

const mintInfo = da.mint;
console.log(`\nOn-chain right after creation:`);
console.log(`  supply          : ${mintInfo.supply}`);
console.log(`  decimals        : ${mintInfo.decimals}`);
console.log(`  mintAuthority   : ${mintInfo.mintAuthority.__option === 'Some' ? mintInfo.mintAuthority.value : 'null'}`);
console.log(`  freezeAuthority : ${mintInfo.freezeAuthority.__option === 'Some' ? mintInfo.freezeAuthority.value : 'null'}`);
console.log(`  metadata PDA    : ${da.metadata.publicKey}  isMutable=${da.metadata.isMutable}  updateAuthority=${da.metadata.updateAuthority}`);
console.log(`\nSOL balance: ${fmtSol(before)} -> ${fmtSol(after)}   (spent ${fmtSol(before - after)})`);
console.log(`\nSTEP 2 DONE. MINT=${mint.publicKey}\n  ${explorerAddr(ctx, mint.publicKey)}`);
console.log('NEXT: run step 3 to revoke mint + freeze authority.');
