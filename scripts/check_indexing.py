#!/usr/bin/env python3
"""
Check Google Search Console indexing status for strategnik.com.

Usage:
    python3 check_indexing.py                   # Check indexing status
    python3 check_indexing.py --submit-indexing  # Also request indexing for non-indexed pages

Requires: pip install -r requirements-gsc.txt
"""

import argparse
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from pathlib import Path

import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# --- Config ---
SITE_URL_CANDIDATES = [
    "sc-domain:strategnik.com",
    "https://strategnik.com/",
    "https://www.strategnik.com/",
    "http://strategnik.com/",
]
SITEMAP_URLS = [
    "https://strategnik.com/sitemap-index.xml",
    "https://strategnik.com/sitemap.xml",
    "https://strategnik.com/sitemap-0.xml",
]
CONTENT_DIR = Path.home() / "strategnik" / "src" / "content" / "posts"
TOKEN_PATH = Path.home() / ".google-search-console-token.json"
ENV_PATH = Path.home() / ".env"
REPORT_PATH = Path(__file__).parent / "indexing-report.md"

SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/webmasters",
    "https://www.googleapis.com/auth/indexing",
]

# --- Env loading ---
def load_env(path: Path) -> dict:
    """Parse a .env file into a dict (handles quotes, comments, blank lines)."""
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
        # Strip surrounding quotes
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
            value = value[1:-1]
        env[key] = value
    return env


# --- Auth ---
def get_credentials(client_id: str, client_secret: str) -> Credentials:
    """Get or refresh Google OAuth2 credentials using installed-app flow."""
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
        # Desktop app flow — no redirect URI needed
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
        print(f"Token cached to {TOKEN_PATH}")

    return creds


# --- GSC helpers ---
def build_gsc_service(creds):
    from googleapiclient.discovery import build
    return build("searchconsole", "v1", credentials=creds)


def build_indexing_service(creds):
    from googleapiclient.discovery import build
    return build("indexing", "v3", credentials=creds)


def detect_site_property(service) -> str:
    """Try each candidate site URL and return the first that works."""
    try:
        result = service.sites().list().execute()
        verified = [s["siteUrl"] for s in result.get("siteEntry", [])]
        print(f"Verified GSC properties: {verified}")
        for candidate in SITE_URL_CANDIDATES:
            if candidate in verified:
                print(f"Using site property: {candidate}")
                return candidate
        # If none of our candidates match, try the first verified one
        if verified:
            print(f"None of our candidates matched. Using first verified: {verified[0]}")
            return verified[0]
    except Exception as e:
        print(f"Warning: Could not list sites: {e}")

    # Fallback: try each candidate via search analytics
    for candidate in SITE_URL_CANDIDATES:
        try:
            service.searchanalytics().query(
                siteUrl=candidate,
                body={"startDate": "2024-01-01", "endDate": "2024-01-02", "dimensions": ["page"], "rowLimit": 1}
            ).execute()
            print(f"Using site property (via probe): {candidate}")
            return candidate
        except Exception:
            continue

    print("ERROR: Could not find a valid GSC property. Add strategnik.com to Google Search Console.")
    sys.exit(1)


# --- Sitemap ---
def fetch_sitemap_urls() -> list[str]:
    """Fetch all page URLs from the sitemap(s)."""
    urls = set()
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

    for sitemap_url in SITEMAP_URLS:
        try:
            resp = requests.get(sitemap_url, timeout=15)
            if resp.status_code != 200:
                continue
            root = ET.fromstring(resp.content)

            # Check if it's a sitemap index
            sub_sitemaps = root.findall(".//sm:sitemap/sm:loc", ns)
            if sub_sitemaps:
                print(f"Found sitemap index at {sitemap_url} with {len(sub_sitemaps)} child sitemaps")
                for loc in sub_sitemaps:
                    try:
                        sub_resp = requests.get(loc.text.strip(), timeout=15)
                        if sub_resp.status_code == 200:
                            sub_root = ET.fromstring(sub_resp.content)
                            for url_el in sub_root.findall(".//sm:url/sm:loc", ns):
                                urls.add(url_el.text.strip())
                    except Exception as e:
                        print(f"  Warning: Failed to fetch sub-sitemap {loc.text}: {e}")
            else:
                # Regular sitemap
                for url_el in root.findall(".//sm:url/sm:loc", ns):
                    urls.add(url_el.text.strip())

            if urls:
                print(f"Found {len(urls)} URLs from sitemap(s)")
                return sorted(urls)
        except Exception:
            continue

    print("Warning: Could not fetch any sitemap. Will rely on content files only.")
    return []


# --- Content files ---
def get_content_urls() -> dict[str, str]:
    """Map slug -> expected URL from local .md/.mdx files."""
    slug_to_file = {}
    if not CONTENT_DIR.exists():
        print(f"Warning: Content directory not found: {CONTENT_DIR}")
        return slug_to_file

    for f in CONTENT_DIR.iterdir():
        if f.suffix in (".md", ".mdx"):
            slug = f.stem
            expected_url = f"https://strategnik.com/posts/{slug}/"
            slug_to_file[expected_url] = str(f)
    print(f"Found {len(slug_to_file)} content files in {CONTENT_DIR}")
    return slug_to_file


# --- URL Inspection ---
def inspect_url(service, site_url: str, page_url: str) -> dict:
    """Use the URL Inspection API to check a single URL."""
    try:
        result = service.urlInspection().index().inspect(
            body={
                "inspectionUrl": page_url,
                "siteUrl": site_url,
            }
        ).execute()
        inspection = result.get("inspectionResult", {})
        index_status = inspection.get("indexStatusResult", {})
        return {
            "url": page_url,
            "verdict": index_status.get("verdict", "UNKNOWN"),
            "coverageState": index_status.get("coverageState", "UNKNOWN"),
            "robotsTxtState": index_status.get("robotsTxtState", "UNKNOWN"),
            "indexingState": index_status.get("indexingState", "UNKNOWN"),
            "lastCrawlTime": index_status.get("lastCrawlTime", ""),
            "pageFetchState": index_status.get("pageFetchState", "UNKNOWN"),
            "crawledAs": index_status.get("crawledAs", "UNKNOWN"),
            "referringUrls": index_status.get("referringUrls", []),
        }
    except Exception as e:
        return {
            "url": page_url,
            "verdict": "ERROR",
            "coverageState": str(e),
            "robotsTxtState": "",
            "indexingState": "",
            "lastCrawlTime": "",
            "pageFetchState": "",
            "crawledAs": "",
            "referringUrls": [],
        }


# --- Search Analytics ---
def get_search_analytics(service, site_url: str, days: int = 28) -> dict:
    """Get impressions and clicks per page over the last N days."""
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    page_data = {}
    start_row = 0
    row_limit = 1000

    while True:
        try:
            response = service.searchanalytics().query(
                siteUrl=site_url,
                body={
                    "startDate": start_date,
                    "endDate": end_date,
                    "dimensions": ["page"],
                    "rowLimit": row_limit,
                    "startRow": start_row,
                }
            ).execute()
        except Exception as e:
            print(f"Warning: Search analytics query failed: {e}")
            break

        rows = response.get("rows", [])
        if not rows:
            break

        for row in rows:
            url = row["keys"][0]
            page_data[url] = {
                "clicks": row.get("clicks", 0),
                "impressions": row.get("impressions", 0),
                "ctr": round(row.get("ctr", 0) * 100, 2),
                "position": round(row.get("position", 0), 1),
            }

        if len(rows) < row_limit:
            break
        start_row += row_limit

    print(f"Search analytics: {len(page_data)} pages with data (last {days} days)")
    return page_data


# --- Indexing API (submit) ---
def submit_indexing(creds, urls: list[str]):
    """Request indexing via the Indexing API for given URLs."""
    if not urls:
        print("No URLs to submit for indexing.")
        return []

    print(f"\nSubmitting {len(urls)} URLs for indexing via Indexing API...")
    print("NOTE: The Indexing API officially supports only JobPosting and BroadcastEvent schema types.")
    print("For other page types, Google may ignore the request. Consider using the manual")
    print("'Request Indexing' button in GSC for non-job/event pages.\n")

    results = []
    headers = {}

    # Get auth token
    if creds.expired:
        creds.refresh(Request())
    headers["Authorization"] = f"Bearer {creds.token}"
    headers["Content-Type"] = "application/json"

    endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"

    for url in urls:
        try:
            body = {"url": url, "type": "URL_UPDATED"}
            resp = requests.post(endpoint, headers=headers, json=body, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                print(f"  ✓ Submitted: {url}")
                results.append({"url": url, "status": "submitted", "detail": data})
            else:
                error_detail = resp.text[:200]
                print(f"  ✗ Failed ({resp.status_code}): {url} — {error_detail}")
                results.append({"url": url, "status": "failed", "detail": error_detail})
        except Exception as e:
            print(f"  ✗ Error: {url} — {e}")
            results.append({"url": url, "status": "error", "detail": str(e)})

    return results


# --- Report ---
def generate_report(
    all_urls: list[str],
    inspection_results: list[dict],
    analytics: dict,
    content_urls: dict,
    submit_results: list[dict] | None = None,
) -> str:
    """Generate the Markdown report."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    indexed = []
    not_indexed = []
    errors = []

    for r in inspection_results:
        verdict = r.get("verdict", "UNKNOWN")
        if verdict == "PASS":
            indexed.append(r)
        elif verdict == "ERROR":
            errors.append(r)
        else:
            not_indexed.append(r)

    # URLs only in content files but not in sitemap
    sitemap_set = set(all_urls)
    content_only = {u: f for u, f in content_urls.items() if u not in sitemap_set}

    # Pages in analytics but not in our URL list
    analytics_only = {u: d for u, d in analytics.items() if u not in sitemap_set and u not in content_urls}

    lines = []
    lines.append(f"# Strategnik.com Indexing Report")
    lines.append(f"")
    lines.append(f"Generated: {now}")
    lines.append(f"")
    lines.append(f"## Summary")
    lines.append(f"")
    lines.append(f"| Metric | Count |")
    lines.append(f"|--------|-------|")
    lines.append(f"| Total URLs checked | {len(all_urls)} |")
    lines.append(f"| Indexed (PASS) | {len(indexed)} |")
    lines.append(f"| Not indexed | {len(not_indexed)} |")
    lines.append(f"| Errors during inspection | {len(errors)} |")
    lines.append(f"| Pages with search impressions (28d) | {len(analytics)} |")
    lines.append(f"| Content files in repo | {len(content_urls)} |")
    if content_only:
        lines.append(f"| Content files NOT in sitemap | {len(content_only)} |")
    lines.append(f"")

    # --- Indexed pages ---
    lines.append(f"## Indexed Pages ({len(indexed)})")
    lines.append(f"")
    if indexed:
        lines.append(f"| URL | Last Crawl | Impressions (28d) | Clicks (28d) | Avg Position |")
        lines.append(f"|-----|------------|-------------------|--------------|--------------|")
        for r in sorted(indexed, key=lambda x: x["url"]):
            url = r["url"]
            crawl = r.get("lastCrawlTime", "—")[:10] if r.get("lastCrawlTime") else "—"
            a = analytics.get(url, {})
            imp = a.get("impressions", 0)
            clicks = a.get("clicks", 0)
            pos = a.get("position", "—")
            lines.append(f"| {url} | {crawl} | {imp} | {clicks} | {pos} |")
    else:
        lines.append("No indexed pages found.")
    lines.append(f"")

    # --- Not indexed ---
    lines.append(f"## Not Indexed ({len(not_indexed)})")
    lines.append(f"")
    if not_indexed:
        lines.append(f"| URL | Verdict | Coverage State | Robots | Fetch State |")
        lines.append(f"|-----|---------|----------------|--------|-------------|")
        for r in sorted(not_indexed, key=lambda x: x["url"]):
            lines.append(
                f"| {r['url']} | {r['verdict']} | {r['coverageState']} | {r['robotsTxtState']} | {r['pageFetchState']} |"
            )
    else:
        lines.append("All checked pages are indexed.")
    lines.append(f"")

    # --- Errors ---
    if errors:
        lines.append(f"## Inspection Errors ({len(errors)})")
        lines.append(f"")
        lines.append(f"| URL | Error |")
        lines.append(f"|-----|-------|")
        for r in sorted(errors, key=lambda x: x["url"]):
            detail = r.get("coverageState", "Unknown error")[:120]
            lines.append(f"| {r['url']} | {detail} |")
        lines.append(f"")

    # --- Content files not in sitemap ---
    if content_only:
        lines.append(f"## Content Files Not in Sitemap ({len(content_only)})")
        lines.append(f"")
        lines.append(f"These .md/.mdx files exist locally but their expected URLs are not in the sitemap:")
        lines.append(f"")
        for url, filepath in sorted(content_only.items()):
            lines.append(f"- `{Path(filepath).name}` -> {url}")
        lines.append(f"")

    # --- Search performance (top pages) ---
    lines.append(f"## Search Performance — Top Pages (28 days)")
    lines.append(f"")
    if analytics:
        sorted_analytics = sorted(analytics.items(), key=lambda x: x[1]["impressions"], reverse=True)
        lines.append(f"| URL | Impressions | Clicks | CTR % | Avg Position |")
        lines.append(f"|-----|-------------|--------|-------|--------------|")
        for url, data in sorted_analytics[:30]:
            lines.append(f"| {url} | {data['impressions']} | {data['clicks']} | {data['ctr']} | {data['position']} |")
    else:
        lines.append("No search analytics data available.")
    lines.append(f"")

    # --- Extra pages in analytics not in our list ---
    if analytics_only:
        lines.append(f"## Pages in Search Analytics Not in Sitemap/Content ({len(analytics_only)})")
        lines.append(f"")
        for url, data in sorted(analytics_only.items(), key=lambda x: x[1]["impressions"], reverse=True):
            lines.append(f"- {url} ({data['impressions']} impressions, {data['clicks']} clicks)")
        lines.append(f"")

    # --- Submit results ---
    if submit_results:
        submitted = [r for r in submit_results if r["status"] == "submitted"]
        failed = [r for r in submit_results if r["status"] != "submitted"]
        lines.append(f"## Indexing Submission Results")
        lines.append(f"")
        lines.append(f"- Submitted: {len(submitted)}")
        lines.append(f"- Failed: {len(failed)}")
        lines.append(f"")
        if failed:
            lines.append(f"### Failed submissions")
            lines.append(f"")
            for r in failed:
                lines.append(f"- {r['url']}: {r['detail'][:120]}")
            lines.append(f"")

    return "\n".join(lines)


# --- Main ---
def main():
    parser = argparse.ArgumentParser(description="Check GSC indexing status for strategnik.com")
    parser.add_argument(
        "--submit-indexing",
        action="store_true",
        help="Submit non-indexed URLs to the Indexing API",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=28,
        help="Number of days for search analytics (default: 28)",
    )
    parser.add_argument(
        "--skip-inspection",
        action="store_true",
        help="Skip URL inspection (faster, analytics-only mode)",
    )
    args = parser.parse_args()

    # Load env
    env = load_env(ENV_PATH)
    # Prefer GSC-specific creds, fall back to general Google OAuth creds
    client_id = env.get("GSC_CLIENT_ID") or env.get("GOOGLE_CLIENT_ID")
    client_secret = env.get("GSC_CLIENT_SECRET") or env.get("GOOGLE_CLIENT_SECRET")

    if not client_id or not client_secret:
        print(f"ERROR: GSC_CLIENT_ID/GSC_CLIENT_SECRET (or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET) must be set in {ENV_PATH}")
        sys.exit(1)

    print("Authenticating with Google...")
    creds = get_credentials(client_id, client_secret)

    print("Building GSC service...")
    service = build_gsc_service(creds)

    # Detect property
    site_url = detect_site_property(service)

    # Gather URLs
    print("\nFetching sitemap URLs...")
    sitemap_urls = fetch_sitemap_urls()

    print("Scanning local content files...")
    content_urls = get_content_urls()

    # Merge all URLs to check
    all_urls = sorted(set(sitemap_urls) | set(content_urls.keys()))
    print(f"\nTotal unique URLs to check: {len(all_urls)}")

    # Search analytics
    print(f"\nFetching search analytics (last {args.days} days)...")
    analytics = get_search_analytics(service, site_url, days=args.days)

    # URL Inspection
    inspection_results = []
    if not args.skip_inspection:
        print(f"\nInspecting {len(all_urls)} URLs (this may take a while due to API rate limits)...")
        print("The URL Inspection API is limited to ~600 requests/day per property.\n")
        for i, url in enumerate(all_urls, 1):
            print(f"  [{i}/{len(all_urls)}] Inspecting: {url}")
            result = inspect_url(service, site_url, url)
            inspection_results.append(result)
            verdict = result.get("verdict", "?")
            coverage = result.get("coverageState", "")
            status_icon = "✓" if verdict == "PASS" else "✗" if verdict == "ERROR" else "?"
            print(f"           {status_icon} {verdict} — {coverage}")
    else:
        print("\nSkipping URL inspection (--skip-inspection)")
        # Create synthetic results from analytics
        for url in all_urls:
            if url in analytics:
                inspection_results.append({"url": url, "verdict": "PASS", "coverageState": "Indexed (inferred from analytics)"})
            else:
                inspection_results.append({"url": url, "verdict": "NEUTRAL", "coverageState": "Unknown (inspection skipped)"})

    # Submit indexing
    submit_results = None
    if args.submit_indexing:
        not_indexed_urls = [
            r["url"] for r in inspection_results
            if r.get("verdict") not in ("PASS",)
        ]
        if not_indexed_urls:
            submit_results = submit_indexing(creds, not_indexed_urls)
        else:
            print("\nAll pages appear indexed — nothing to submit.")

    # Generate report
    print("\nGenerating report...")
    report = generate_report(all_urls, inspection_results, analytics, content_urls, submit_results)
    REPORT_PATH.write_text(report)
    print(f"Report saved to {REPORT_PATH}")

    # Quick summary to stdout
    indexed_count = sum(1 for r in inspection_results if r.get("verdict") == "PASS")
    not_indexed_count = sum(1 for r in inspection_results if r.get("verdict") not in ("PASS", "ERROR"))
    error_count = sum(1 for r in inspection_results if r.get("verdict") == "ERROR")
    print(f"\n{'='*50}")
    print(f"SUMMARY: {indexed_count} indexed | {not_indexed_count} not indexed | {error_count} errors")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
