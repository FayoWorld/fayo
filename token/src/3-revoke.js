// STEP 3: revoke mint authority and freeze authority (set to null) with the SPL Token program.
import { publicKey, none } from '@metaplex-foundation/umi';
import { setAuthority, AuthorityType, fetchMint } from '@metaplex-foundation/mpl-toolbox';
import { setup, loadState, saveState, solBalance, fmtSol, confirm, withPriority, sendTx, explorerAddr } from './common.js';

const ctx = await setup();
const { umi } = ctx;
const state = loadState(ctx.statePath);
if (!state.mint) throw new Error('No mint in state file. Run step 2 first.');
const mintPk = publicKey(state.mint);

const show = (o) => (o.__option === 'Some' ? o.value : 'null');
let mint = await fetchMint(umi, mintPk);
console.log(`Mint            : ${mintPk}`);
console.log(`mintAuthority   : ${show(mint.mintAuthority)}`);
console.log(`freezeAuthority : ${show(mint.freezeAuthority)}`);

let builder = null;
const actions = [];
for (const [field, type, label] of [
  ['mintAuthority', AuthorityType.MintTokens, 'MintTokens'],
  ['freezeAuthority', AuthorityType.FreezeAccount, 'FreezeAccount'],
]) {
  const cur = mint[field];
  if (cur.__option === 'None') { console.log(`  ${label}: already revoked`); continue; }
  if (cur.value !== umi.identity.publicKey) {
    throw new Error(`${field} is ${cur.value}, not this wallet (${umi.identity.publicKey}); cannot revoke with this keypair.`);
  }
  const ix = setAuthority(umi, { owned: mintPk, owner: umi.identity, authorityType: type, newAuthority: none() });
  builder = builder ? builder.add(ix) : ix;
  actions.push(label);
}
if (!builder) { console.log('\nNothing to do: both authorities are already null. Run step 4 (verify).'); process.exit(0); }

const before = await solBalance(ctx);
console.log(`\nWill revoke: ${actions.join(' + ')} (single transaction, irreversible)`);
console.log(`Estimated cost: ~${fmtSol(5000n + (100_000n * BigInt(ctx.priorityMicroLamports)) / 1_000_000n)} (fee only, no rent)`);
console.log(`SOL balance   : ${fmtSol(before)}`);
if (!(await confirm(ctx, `About to PERMANENTLY revoke ${actions.join(' + ')} on ${mintPk} (${ctx.cluster.toUpperCase()}).`))) process.exit(0);

state.revokeSignature = await sendTx(ctx, withPriority(ctx, builder, 100_000), 'setAuthority(null)');
mint = await fetchMint(umi, mintPk);
console.log(`\nmintAuthority   : ${show(mint.mintAuthority)}`);
console.log(`freezeAuthority : ${show(mint.freezeAuthority)}`);
const after = await solBalance(ctx);
state.costs = { ...(state.costs || {}), step3_revoke_lamports: (before - after).toString() };
saveState(ctx.statePath, state);
console.log(`SOL balance: ${fmtSol(before)} -> ${fmtSol(after)}   (spent ${fmtSol(before - after)})`);
if (mint.mintAuthority.__option !== 'None' || mint.freezeAuthority.__option !== 'None') { console.error('FAILED: authorities not null'); process.exit(1); }
console.log(`\nSTEP 3 DONE. ${explorerAddr(ctx, mintPk)}\nNEXT: run step 4 (verify).`);
