#!/usr/bin/env python3
"""Render README.md, docs/whitepaper.md, docs/whitepaper.html and Whitepaper.pdf from tokenomics.json.

Usage:  python3 scripts/build_readme.py            # README + whitepaper md/html (+ PDF if weasyprint is installed)
        python3 scripts/build_readme.py --no-pdf   # skip the PDF
Requires: python3 (stdlib) for README; `pip install markdown weasyprint` for the whitepaper HTML/PDF.
"""
import datetime, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TPL = ROOT / "templates"
B58 = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")


def fmt_int(n):
    return f"{int(n):,}"


def pct(p):
    return f"{p:g}%"


def link_or_text(v, label):
    """Plain text (e.g. "—") stays as text; base58 addresses become Solscan account links; URLs become links."""
    if B58.match(v):
        return f"[{label}](https://solscan.io/account/{v})"
    if v.startswith("http"):
        return f"[{label}]({v})"
    return v


def html_link(v, label):
    if B58.match(v):
        return f'<a href="https://solscan.io/account/{v}">{label}</a>'
    if v.startswith("http"):
        return f'<a href="{v}">{label}</a>'
    return v


def short(s, n=8):
    return f"{s[:n]}…{s[-n:]}"


def tx_url(sig):
    return f"https://solscan.io/tx/{sig}"


def acct_url(a):
    return f"https://solscan.io/account/{a}"


def build_context(d):
    p, t, st, v = d["project"], d["token"], d["staking"], d["vesting"]
    supply = t["total_supply"]
    allocs = d["allocations"]
    total = round(sum(a["percent"] for a in allocs), 6)
    if total != 100:
        sys.exit(f"ERROR: allocations sum to {total}%, expected 100%")

    def amount(a):
        return a.get("amount_display") or fmt_int(supply * a["percent"] / 100)

    def wlabel(a):
        return a.get("wallet_label", "Wallet")

    def clabel(a):
        return a.get("contract_label", "Streamflow")

    # README allocation table (Wallet and Vesting Contract cells auto-link addresses/URLs)
    rows = ["| Section | % of Total Supply | Amount (FAYO) | % Unlock at TGE | Cliff | Unlock Duration | Frequency | Notes | Wallet | Vesting Contract |",
            "|----------|------------------|---------------|----------------|--------|------------------|------------|--------|------|------------------|"]
    for a in allocs:
        rows.append(f"| **{a['section']}** | {pct(a['percent'])} | {amount(a)} | {a['tge_unlock']} | {a['cliff']} | {a['duration']} | {a['frequency']} | "
                    f"{a['notes']} | {link_or_text(a['wallet'], wlabel(a))} | {link_or_text(a['vesting_contract'], clabel(a))} |")
    rows.append(f"| **Total** | **{pct(total)}** | **{fmt_int(supply)}** | | | | | | | |")

    # README on-chain proof table (full addresses + tx links)
    proof = ["| Section | Wallet / Recipient | Vesting Contract / Pool | Transaction |",
             "|---------|--------------------|-------------------------|-------------|"]
    for a in allocs:
        w = a["wallet"] if B58.match(a["wallet"]) else st["stake_pool"]
        wcell = f"[`{w}`]({acct_url(w)})" if B58.match(a["wallet"]) else f"Stake pool [`{w}`]({st['stake_pool_url']})"
        if a.get("contract_id"):
            ccell = f"[`{a['contract_id']}`]({a['vesting_contract']})"
        elif B58.match(a["vesting_contract"]):
            ccell = f"Reward pool [`{a['vesting_contract']}`]({acct_url(a['vesting_contract'])})"
        else:
            ccell = a["vesting_contract"]
        proof.append(f"| **{a['section']}** | {wcell} | {ccell} | [{a['tx_label']}: `{short(a['tx'], 6)}`]({tx_url(a['tx'])}) |")

    # Whitepaper allocation table (HTML so we can style the total row)
    h = ['<table><thead><tr><th>Allocation</th><th>%</th><th>Amount ({})</th><th>TGE</th><th>Vesting</th><th>Wallet</th><th>Contract</th><th>Tx</th></tr></thead><tbody>'.format(p["symbol"])]
    for a in allocs:
        vest = "Unlocked" if a["duration"] in ("–", "-", "") else f"{a['duration']}, {a['frequency'].lower()}"
        h.append(f"<tr><td><b>{a['section']}</b><br><small>{a['notes']}</small></td><td>{pct(a['percent'])}</td><td>{amount(a)}</td>"
                 f"<td>{a['tge_unlock']}</td><td>{vest}</td><td>{html_link(a['wallet'], wlabel(a))}</td><td>{html_link(a['vesting_contract'], clabel(a))}</td>"
                 f"<td><a href=\"{tx_url(a['tx'])}\">{a['tx_label']}</a></td></tr>")
    h.append(f'<tr class="total"><td>Total</td><td>{pct(total)}</td><td>{fmt_int(supply)}</td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>')

    # Whitepaper address appendix (full addresses, small font)
    ap = ['<table class="addr"><thead><tr><th>Allocation</th><th>Wallet / Recipient</th><th>Vesting contract / Pool</th></tr></thead><tbody>']
    for a in allocs:
        w = a["wallet"] if B58.match(a["wallet"]) else st["stake_pool"]
        c = a.get("contract_id") or (a["vesting_contract"] if B58.match(a["vesting_contract"]) else "—")
        ap.append(f"<tr><td>{a['section']}</td><td><code>{w}</code></td><td><code>{c}</code></td></tr>")
    ap.append("</tbody></table>")

    mint = t["mint"]
    rate = 0.0015
    ctx = {
        "allocation_table": "\n".join(rows),
        "proof_table": "\n".join(proof),
        "wp_allocation_table": "\n".join(h),
        "wp_address_table": "\n".join(ap),
        "allocation_status": d.get("allocation_status", ""),
        "total_supply_fmt": fmt_int(supply),
        "solscan_token": f"https://solscan.io/token/{mint}",
        "explorer_token": f"https://explorer.solana.com/address/{mint}",
        "rugcheck": f"https://rugcheck.xyz/tokens/{mint}",
        "creator_wallet_url": acct_url(t["creator_wallet"]),
        "create_tx_url": tx_url(t["create_tx"]),
        "revoke_tx_url": tx_url(t["revoke_tx"]),
        "create_tx_short": short(t["create_tx"], 10),
        "revoke_tx_short": short(t["revoke_tx"], 10),
        "mint_short": short(mint, 6),
        "stake_pool_short": short(st["stake_pool"], 6),
        "reward_pool_url": acct_url(st["reward_pool"]),
        "reward_fund_fmt": fmt_int(st["reward_fund"]),
        "staking_create_pool_tx_url": tx_url(st["create_pool_tx"]),
        "staking_create_reward_pool_tx_url": tx_url(st["create_reward_pool_tx"]),
        "staking_fund_tx_url": tx_url(st["fund_tx"]),
        "staking_create_pool_tx_short": short(st["create_pool_tx"], 10),
        "staking_create_reward_pool_tx_short": short(st["create_reward_pool_tx"], 10),
        "staking_fund_tx_short": short(st["fund_tx"], 10),
        "rate_6m_pct": f"{rate * 180 * 1 * 100:.0f}%",
        "rate_12m_pct": f"{rate * 365 * 2 * 100:.0f}%",
        "website_host": re.sub(r"^https?://", "", p["website"]).rstrip("/"),
        "github_path": re.sub(r"^https?://github\.com/", "", p["github_url"]).rstrip("/"),
        "build_date": datetime.date.today().strftime("%b %d, %Y"),
        "doc_version": d.get("doc_version", "1.0"),
    }
    for sect in ("project", "token", "links", "staking", "vesting"):
        for k, val in d[sect].items():
            ctx[f"{sect}.{k}"] = val
    return ctx


def render(text, ctx):
    def sub(m):
        k = m.group(1).strip()
        if k not in ctx:
            sys.exit(f"ERROR: unknown placeholder {{{{{k}}}}}")
        return str(ctx[k])
    return re.sub(r"\{\{\s*([\w.]+)\s*\}\}", sub, text)


def main():
    d = json.loads((ROOT / "tokenomics.json").read_text(encoding="utf-8"))
    ctx = build_context(d)

    (ROOT / "README.md").write_text(render((TPL / "README.template.md").read_text(encoding="utf-8"), ctx), encoding="utf-8")
    print("wrote README.md")

    wp_md = render((TPL / "whitepaper.template.md").read_text(encoding="utf-8"), ctx)
    (ROOT / "docs").mkdir(exist_ok=True)
    (ROOT / "docs" / "whitepaper.md").write_text(wp_md, encoding="utf-8")
    print("wrote docs/whitepaper.md")

    try:
        import markdown
    except ImportError:
        print("markdown not installed: skipping whitepaper HTML/PDF (pip install markdown weasyprint)")
        return
    body = markdown.markdown(wp_md, extensions=["tables", "md_in_html"])
    css = (TPL / "whitepaper.css").read_text(encoding="utf-8")
    html = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{d["project"]["name"]} ({d["project"]["symbol"]}) — Project Overview Document</title>'
            f"<style>{css}</style></head><body>{body}</body></html>")
    (ROOT / "docs" / "whitepaper.html").write_text(html, encoding="utf-8")
    print("wrote docs/whitepaper.html")

    if "--no-pdf" in sys.argv:
        return
    try:
        from weasyprint import HTML
    except ImportError:
        print("weasyprint not installed: skipping Whitepaper.pdf")
        return
    HTML(string=html, base_url=str(ROOT / "docs") + "/").write_pdf(str(ROOT / "Whitepaper.pdf"))
    print("wrote Whitepaper.pdf")


if __name__ == "__main__":
    main()
