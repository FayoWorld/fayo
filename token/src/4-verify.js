// STEP 4: read-only verification of everything RugCheck / wallets look at.
import { publicKey } from '@metaplex-foundation/umi';
import { fetchDigitalAsset, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { fetchToken, findAssociatedTokenPda, SPL_TOKEN_PROGRAM_ID } from '@metaplex-foundation/mpl-toolbox';
import { setup, loadState, solBalance, fmtSol, TOKEN, fetchWithRetry, explorerAddr, solscanToken } from './common.js';

const ctx = await setup();
const { umi } = ctx;
const state = loadState(ctx.statePath);
const mintArg = ctx.args.mint || process.env.MINT || state.mint;
if (!mintArg) throw new Error('No mint (state file or --mint=<address>).');
const mintPk = publicKey(mintArg);

const results = [];
const check = (name, ok, detail) => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(34)} ${detail}`); };
const show = (o) => (o.__option === 'Some' ? o.value : 'null');

console.log(`SOL balance: ${fmtSol(await solBalance(ctx))}\n`);
const acc = await umi.rpc.getAccount(mintPk);
check('mint owned by classic SPL Token', acc.exists && acc.owner === SPL_TOKEN_PROGRAM_ID, acc.exists ? acc.owner : 'missing');

const da = await fetchDigitalAsset(umi, mintPk);
const m = da.mint, md = da.metadata;
check('decimals', m.decimals === TOKEN.decimals, String(m.decimals));
check('supply', m.supply === TOKEN.supplyBaseUnits, `${m.supply} base units = ${m.supply / 10n ** BigInt(m.decimals)} FAYO`);
check('mintAuthority null', m.mintAuthority.__option === 'None', show(m.mintAuthority));
check('freezeAuthority null', m.freezeAuthority.__option === 'None', show(m.freezeAuthority));
check('metadata isMutable false', md.isMutable === false, String(md.isMutable));
check('metadata name', md.name === TOKEN.name, JSON.stringify(md.name));
check('metadata symbol', md.symbol === TOKEN.symbol, JSON.stringify(md.symbol));
check('sellerFeeBasisPoints 0', md.sellerFeeBasisPoints === 0, String(md.sellerFeeBasisPoints));
check('tokenStandard Fungible', md.tokenStandard.__option === 'Some' && md.tokenStandard.value === TokenStandard.Fungible,
  md.tokenStandard.__option === 'Some' ? TokenStandard[md.tokenStandard.value] : 'none');
console.log(`INFO  updateAuthority                    ${md.updateAuthority}  (irrelevant: metadata is immutable)`);
console.log(`INFO  metadata PDA                       ${md.publicKey}`);
if (state.metadataUri) check('uri matches state file', md.uri === state.metadataUri, md.uri);

// creator ATA holds the full supply (only meaningful before distribution)
const [ata] = findAssociatedTokenPda(umi, { mint: mintPk, owner: umi.identity.publicKey });
try {
  const tok = await fetchToken(umi, ata);
  console.log(`INFO  creator ATA ${ata} balance ${tok.amount} (${(Number(tok.amount) * 100 / Number(m.supply)).toFixed(2)}% of supply)`);
} catch { console.log(`INFO  creator ATA ${ata} not found`); }

// off-chain JSON
let json = null;
try {
  const r = await fetchWithRetry(md.uri);
  json = await r.json();
  check('uri reachable + valid JSON', true, `HTTP ${r.status} ${r.headers.get('content-type')}`);
} catch (e) { check('uri reachable + valid JSON', false, e.message); }
if (json) {
  check('json name/symbol match', json.name === TOKEN.name && json.symbol === TOKEN.symbol, `${json.name}/${json.symbol}`);
  check('json description', json.description === TOKEN.description, json.description?.slice(0, 40) + '…');
  check('json links', json.website === TOKEN.website && json.twitter === TOKEN.twitter && json.telegram === TOKEN.telegram
    && json.extensions?.website === TOKEN.website && json.extensions?.twitter === TOKEN.twitter && json.extensions?.telegram === TOKEN.telegram
    && json.external_url === TOKEN.website, `${json.website} ${json.twitter} ${json.telegram}`);
  check('json properties.files[0] = image', json.properties?.files?.[0]?.uri === json.image && json.properties?.files?.[0]?.type === 'image/png'
    && json.properties?.category === 'image', json.properties?.files?.[0]?.uri);
  try {
    const ir = await fetchWithRetry(json.image);
    const buf = Buffer.from(await ir.arrayBuffer());
    const isPng = buf.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
    const w = isPng ? buf.readUInt32BE(16) : 0, h = isPng ? buf.readUInt32BE(20) : 0;
    check('image reachable PNG, square', isPng && w === h && w >= 256, `HTTP ${ir.status} ${ir.headers.get('content-type')} ${w}x${h} ${buf.length} B`);
  } catch (e) { check('image reachable PNG, square', false, e.message); }
}

const failed = results.filter((x) => !x).length;
console.log(`\n${failed === 0 ? 'ALL CHECKS PASSED' : failed + ' CHECK(S) FAILED'}  (${results.length} checks)`);
console.log(`Explorer: ${explorerAddr(ctx, mintPk)}`);
console.log(`Solscan : ${solscanToken(ctx, mintPk)}`);
if (ctx.cluster === 'mainnet-beta') console.log(`RugCheck: https://rugcheck.xyz/tokens/${mintPk}`);
if (state.costs) console.log(`Recorded costs (lamports): ${JSON.stringify(state.costs)}`);
process.exit(failed === 0 ? 0 : 1);
