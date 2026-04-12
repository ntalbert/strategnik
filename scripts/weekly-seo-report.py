#!/usr/bin/env python3
"""
Weekly SEO monitoring report for strategnik.com.
Pulls GSC data, compares week-over-week, and generates a status report.

Usage:
    python3 weekly-seo-report.py           # Generate report
    python3 weekly-seo-report.py --days 28 # Custom date range
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# --- Config ---
SITE_URL = "sc-domain:strategnik.com"
TOKEN_PATH = Path.home() / ".google-search-console-token.json"
ENV_PATH = Path.home() / ".env"
REPORT_DIR = Path.home() / "strategnik" / "scripts" / "reports"
SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/webmasters",
]


def load_env(path: Path) -> dict:
    env = {}
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
            value = value[1:-1]
        env[key] = value
    return env


def get_credentials():
    env = load_env(ENV_PATH)
    client_id = env.get("GSC_CLIENT_ID") or env.get("GOOGLE_CLIENT_ID")
    client_secret = env.get("GSC_CLIENT_SECRET") or env.get("GOOGLE_CLIENT_SECRET")

    if not client_id or not client_secret:
        print("ERROR: GSC credentials not found in ~/.env")
        sys.exit(1)

    creds = None
    if TOKEN_PATH.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
        except Exception:
            creds = None

    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            TOKEN_PATH.write_text(creds.to_json())
            return creds
        except Exception:
            creds = None

    if not creds or not creds.valid:
        client_config = {
            "installed": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": ["http://localhost"],
            }
        }
        flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
        creds = flow.run_local_server(port=0, open_browser=True)
        TOKEN_PATH.write_text(creds.to_json())

    return creds


def get_analytics(service, start_date, end_date, dimensions=None):
    """Fetch search analytics data."""
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": dimensions or ["page"],
        "rowLimit": 500,
    }
    resp = service.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
    return resp.get("rows", [])


def get_query_data(service, start_date, end_date):
    """Fetch query-level analytics."""
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": ["query"],
        "rowLimit": 100,
    }
    resp = service.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
    return resp.get("rows", [])


def generate_report(this_week_pages, last_week_pages, this_week_queries, last_week_queries, this_period, last_period):
    """Generate markdown report comparing two periods."""
    lines = []
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Build lookup dicts
    tw = {r["keys"][0]: r for r in this_week_pages}
    lw = {r["keys"][0]: r for r in last_week_pages}
    all_pages = sorted(set(list(tw.keys()) + list(lw.keys())))

    tw_q = {r["keys"][0]: r for r in this_week_queries}
    lw_q = {r["keys"][0]: r for r in last_week_queries}

    # Totals
    tw_impressions = sum(r.get("impressions", 0) for r in this_week_pages)
    tw_clicks = sum(r.get("clicks", 0) for r in this_week_pages)
    lw_impressions = sum(r.get("impressions", 0) for r in last_week_pages)
    lw_clicks = sum(r.get("clicks", 0) for r in last_week_pages)

    imp_change = tw_impressions - lw_impressions
    click_change = tw_clicks - lw_clicks
    imp_pct = (imp_change / lw_impressions * 100) if lw_impressions > 0 else 0
    click_pct = (click_change / lw_clicks * 100) if lw_clicks > 0 else 0

    def arrow(val):
        if val > 0:
            return f"+{val}"
        return str(val)

    def arrow_pct(val):
        if val > 0:
            return f"+{val:.1f}%"
        elif val < 0:
            return f"{val:.1f}%"
        return "0%"

    lines.append(f"# Strategnik Weekly SEO Report")
    lines.append(f"")
    lines.append(f"**Generated:** {now}")
    lines.append(f"**This period:** {this_period[0]} to {this_period[1]}")
    lines.append(f"**Compared to:** {last_period[0]} to {last_period[1]}")
    lines.append(f"")

    lines.append(f"## Summary")
    lines.append(f"")
    lines.append(f"| Metric | This Period | Last Period | Change |")
    lines.append(f"|--------|------------|-------------|--------|")
    lines.append(f"| Impressions | {tw_impressions:,} | {lw_impressions:,} | {arrow(imp_change)} ({arrow_pct(imp_pct)}) |")
    lines.append(f"| Clicks | {tw_clicks:,} | {lw_clicks:,} | {arrow(click_change)} ({arrow_pct(click_pct)}) |")
    lines.append(f"| Pages with impressions | {len(tw)} | {len(lw)} | {arrow(len(tw) - len(lw))} |")
    lines.append(f"")

    # Top pages by impressions (this week)
    top_pages = sorted(this_week_pages, key=lambda x: x.get("impressions", 0), reverse=True)[:15]
    lines.append(f"## Top Pages (This Period)")
    lines.append(f"")
    lines.append(f"| Page | Impressions | Clicks | CTR | Avg Pos | vs Last |")
    lines.append(f"|------|-------------|--------|-----|---------|---------|")
    for r in top_pages:
        url = r["keys"][0].replace("https://strategnik.com", "").replace("https://www.strategnik.com", "") or "/"
        imp = r.get("impressions", 0)
        clicks = r.get("clicks", 0)
        ctr = r.get("ctr", 0) * 100
        pos = r.get("position", 0)
        # Compare to last week
        lw_data = lw.get(r["keys"][0], {})
        lw_imp = lw_data.get("impressions", 0)
        diff = imp - lw_imp
        diff_str = arrow(diff) if diff != 0 else "—"
        lines.append(f"| {url} | {imp} | {clicks} | {ctr:.1f}% | {pos:.1f} | {diff_str} |")
    lines.append(f"")

    # New pages (in this week but not last)
    new_pages = [p for p in all_pages if p in tw and p not in lw]
    if new_pages:
        lines.append(f"## New Pages Appearing ({len(new_pages)})")
        lines.append(f"")
        for p in new_pages:
            r = tw[p]
            url = p.replace("https://strategnik.com", "").replace("https://www.strategnik.com", "") or "/"
            lines.append(f"- **{url}** — {r.get('impressions', 0)} impressions, pos {r.get('position', 0):.1f}")
        lines.append(f"")

    # Dropped pages (in last week but not this)
    dropped = [p for p in all_pages if p in lw and p not in tw]
    if dropped:
        lines.append(f"## Pages That Dropped Off ({len(dropped)})")
        lines.append(f"")
        for p in dropped:
            r = lw[p]
            url = p.replace("https://strategnik.com", "").replace("https://www.strategnik.com", "") or "/"
            lines.append(f"- **{url}** — had {r.get('impressions', 0)} impressions last period")
        lines.append(f"")

    # Top queries
    top_queries = sorted(this_week_queries, key=lambda x: x.get("impressions", 0), reverse=True)[:20]
    if top_queries:
        lines.append(f"## Top Queries (This Period)")
        lines.append(f"")
        lines.append(f"| Query | Impressions | Clicks | CTR | Avg Pos | vs Last |")
        lines.append(f"|-------|-------------|--------|-----|---------|---------|")
        for r in top_queries:
            q = r["keys"][0]
            imp = r.get("impressions", 0)
            clicks = r.get("clicks", 0)
            ctr = r.get("ctr", 0) * 100
            pos = r.get("position", 0)
            lw_data = lw_q.get(q, {})
            lw_imp = lw_data.get("impressions", 0)
            diff = imp - lw_imp
            diff_str = arrow(diff) if diff != 0 else "—"
            lines.append(f"| {q} | {imp} | {clicks} | {ctr:.1f}% | {pos:.1f} | {diff_str} |")
        lines.append(f"")

    # Position movers
    movers = []
    for page in all_pages:
        if page in tw and page in lw:
            tw_pos = tw[page].get("position", 0)
            lw_pos = lw[page].get("position", 0)
            change = lw_pos - tw_pos  # positive = improved
            if abs(change) >= 2:
                url = page.replace("https://strategnik.com", "").replace("https://www.strategnik.com", "") or "/"
                movers.append((url, tw_pos, lw_pos, change))

    if movers:
        movers.sort(key=lambda x: x[3], reverse=True)
        lines.append(f"## Position Changes (2+ positions)")
        lines.append(f"")
        lines.append(f"| Page | Now | Was | Change |")
        lines.append(f"|------|-----|-----|--------|")
        for url, now_pos, was_pos, change in movers:
            direction = "improved" if change > 0 else "dropped"
            lines.append(f"| {url} | {now_pos:.1f} | {was_pos:.1f} | {arrow(change)} ({direction}) |")
        lines.append(f"")

    return "\n".join(lines)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Weekly SEO monitoring report")
    parser.add_argument("--days", type=int, default=7, help="Period length in days (default: 7)")
    args = parser.parse_args()

    print("Authenticating with Google...")
    creds = get_credentials()

    from googleapiclient.discovery import build
    service = build("searchconsole", "v1", credentials=creds)

    today = datetime.now().date()
    # GSC data has a 2-3 day lag
    end_this = today - timedelta(days=3)
    start_this = end_this - timedelta(days=args.days - 1)
    end_last = start_this - timedelta(days=1)
    start_last = end_last - timedelta(days=args.days - 1)

    this_period = (start_this.isoformat(), end_this.isoformat())
    last_period = (start_last.isoformat(), end_last.isoformat())

    print(f"Fetching data: {this_period[0]} to {this_period[1]} vs {last_period[0]} to {last_period[1]}")

    this_pages = get_analytics(service, this_period[0], this_period[1])
    last_pages = get_analytics(service, last_period[0], last_period[1])
    this_queries = get_query_data(service, this_period[0], this_period[1])
    last_queries = get_query_data(service, last_period[0], last_period[1])

    print(f"This period: {len(this_pages)} pages, {len(this_queries)} queries")
    print(f"Last period: {len(last_pages)} pages, {len(last_queries)} queries")

    report = generate_report(this_pages, last_pages, this_queries, last_queries, this_period, last_period)

    # Save report
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report_file = REPORT_DIR / f"seo-report-{datetime.now().strftime('%Y-%m-%d')}.md"
    report_file.write_text(report)
    print(f"\nReport saved to {report_file}")

    # Also save as latest for easy access
    latest = REPORT_DIR / "seo-report-latest.md"
    latest.write_text(report)

    # Print summary to stdout
    print("\n" + "=" * 50)
    total_imp = sum(r.get("impressions", 0) for r in this_pages)
    total_clicks = sum(r.get("clicks", 0) for r in this_pages)
    last_imp = sum(r.get("impressions", 0) for r in last_pages)
    print(f"IMPRESSIONS: {total_imp:,} (was {last_imp:,})")
    print(f"CLICKS: {total_clicks:,}")
    print(f"PAGES WITH DATA: {len(this_pages)}")
    print("=" * 50)


if __name__ == "__main__":
    main()
