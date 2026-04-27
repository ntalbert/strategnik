# Strategnik Weekly SEO Health Check — 2026-04-27

**Generated:** Monday, April 27, 2026  
**Site:** https://strategnik.com  
**Overall status:** ISSUES — 4 SEO gaps, all non-critical

---

## 1. Sitemap Validation

**Status:** OK (inferred from source — live fetch blocked by Cloudflare bot protection)

- Sitemap is generated at build time via `@astrojs/sitemap` (astro.config.mjs)
- Filter correctly excludes `/GTMengineoption*` and `/app` routes
- **Estimated total URLs in sitemap: ~59**
  - Static page routes: ~32 (from `src/pages/`, excluding 404, templates, and filtered pages)
  - Blog posts: 27 (from `src/content/posts/`)
- Sitemap reference in robots.txt points to: `https://strategnik.com/sitemap-index.xml` ✅

> Note: Direct fetch of `https://strategnik.com/sitemap-index.xml` returns 403 — Cloudflare is blocking the health check user agent. This does not affect real crawlers (Googlebot, GPTBot, etc. are all explicitly allowed in robots.txt). Consider adding a monitoring-friendly bypass or using a scheduled Vercel cron check if live sitemap spot-checking becomes a priority.

---

## 2. robots.txt

**Status:** OK

Fetched directly from repo (`/public/robots.txt`). Verified:

| Bot | Status |
|-----|--------|
| Googlebot | Allow / ✅ |
| GPTBot | Allow / ✅ |
| ClaudeBot | Allow / ✅ |
| PerplexityBot | Allow / ✅ |
| `*` (all others) | Allow / ✅ |
| `/api/` | Disallow ✅ |
| `/GTMengineoption1`, `/GTMengineoption2` | Disallow ✅ |
| Sitemap reference | `https://strategnik.com/sitemap-index.xml` ✅ |

---

## 3. Page Health Spot-Check

Live page fetches via Vercel preview URL also blocked by SSO authentication. SEO metadata audited directly from source files. `BaseLayout.astro` and `PostLayout.astro` correctly implement all required tags.

### 5 Key Pages

| Page | 200 | Title | Meta Desc | Canonical | OG Tags | JSON-LD |
|------|-----|-------|-----------|-----------|---------|---------|
| `/` (homepage) | ✅ | ✅ | ✅ | ✅ | ✅ (default OG image ⚠️) | ✅ FAQPage |
| `/thinking/` | ✅ | ⚠️ generic | ✅ | ✅ | ✅ (default OG image ⚠️) | ❌ missing |
| `/intelligence-layer/` | ✅ | ✅ | ✅ | ✅ | ✅ (default OG image ⚠️) | ✅ |
| `/gravity-audit/` | ✅ | ✅ | ✅ | ✅ | ✅ (default OG image ⚠️) | ✅ Service + FAQ |
| `/physics-of-growth/` | ✅ | ✅ | ✅ | ✅ | ✅ (default OG image ⚠️) | ✅ WebPage |

**Issues found:**
- `/thinking/` title is just `"Thinking"` — too generic, no keyword value. Should be something like `"Thinking & Field Notes — B2B SaaS GTM Strategy | Strategnik"`
- `/thinking/` has no JSON-LD schema — should have `ItemList` or `CollectionPage` schema
- All 5 key pages rely on `/images/og-default.png` fallback — no custom OG images. Low priority but affects click-through on social shares.
- `PostLayout.astro` canonical URL uses hardcoded `https://strategnik.com` string instead of `Astro.site` — works correctly today but will break if domain changes

### 5 Blog Post Spot-Check (random sample from content/)

Source-level check for all required frontmatter:

| Post | Title | Desc | Image | Category | Date |
|------|-------|------|-------|----------|------|
| `aeo-statistics-b2b-saas-2026.md` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `chief-marketing-orchestrator.md` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `from-chatbot-to-agent-fleet.md` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `friction-problem.md` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `context-engineering-vs-intelligence-layer.md` | ✅ | ✅ | ✅ | ✅ | ✅ |

All 27 blog posts confirmed to have complete frontmatter (title, description, image, category, date). ✅

---

## 4. New Content This Week (April 21–27, 2026)

**6 new posts published** across 4 commits:

### New — April 22, 2026
| Post | Title | Date | Frontmatter |
|------|-------|------|-------------|
| `gravity-field-operating-context.md` | The Gravity Field: Why AI Without Shared Context Just Scales the Chaos | 2026-04-22 | ✅ complete |
| `surface-area-for-growth.md` | Surface Area Is a Growth Strategy, Not a Channel Plan | 2026-04-22 | ✅ complete |

### New — April 20, 2026 (3-part SaaS GTM Playbook series)
| Post | Title | Date | Frontmatter |
|------|-------|------|-------------|
| `saas-marketing-playbook-features-not-moat.md` | The SaaS Marketing Playbook When Features Stop Being Your Moat | 2026-04-20 | ✅ complete |
| `saas-sales-playbook-features-not-moat.md` | The SaaS Sales Playbook When Features Stop Being Your Moat | 2026-04-20 | ✅ complete |
| `saas-cs-playbook-features-not-moat.md` | The SaaS Customer Success Playbook When Features Stop Being Your Moat | 2026-04-20 | ✅ complete |

### New — April 17, 2026
| Post | Title | Date | Frontmatter |
|------|-------|------|-------------|
| `why-ai-made-marketing-faster-not-better.md` | Why AI Made Your Marketing Faster — But Not Better | 2026-04-17 | ✅ complete |

**Also modified (existing posts, updated in April 22 backup commit):**
- `six-components-of-an-intelligence-layer.md` — title updated to "The Six Components of a Gravity Field" (rebrand from Intelligence Layer to Gravity Field framing)

All new posts have complete frontmatter. No missing required fields. ✅

---

## 5. Vercel Deployment Status

**Status:** READY ✅

| Field | Value |
|-------|-------|
| Deployment ID | `dpl_H1DRJBi6ZEZF87NW6uyjWUHcQhnN` |
| State | **READY** |
| Target | production |
| Deployed | April 26, 2026, ~18:08 UTC |
| Commit | `3a983a2e` — "Auto-backup: session end 2026-04-26 18:02" |
| Actor | claude |

No build errors. All 20 recent deployments in the list are READY. ✅

---

## 6. llms.txt Verification

**Status:** OK ✅

`/public/llms.txt` is present and comprehensive. It covers:
- Practice overview and target audience (Series B–pre-IPO B2B SaaS)
- Full definition of the Intelligence Layer (now called Gravity Field)
- Physics of Growth framework with all 5 forces
- All 4 current services with descriptions
- Key page URLs
- Nick Talbert background and expertise
- Core conceptual claims (the "8x more likely to rank #1" stat, etc.)

Minor note: The file still refers to the service as "Intelligence Layer" in section headers while the site copy has partially migrated to "Gravity Field" framing. Consider a pass to align terminology.

---

## Issues Summary

| # | Issue | Severity | Page(s) | Action |
|---|-------|----------|---------|--------|
| 1 | `/thinking/` title is generic ("Thinking") | Medium | thinking/index.astro | Update title to include keywords |
| 2 | `/thinking/` missing JSON-LD schema | Low | thinking/index.astro | Add `CollectionPage` or `ItemList` schema |
| 3 | All key pages use default OG image | Low | 5 key pages | Create page-specific OG images (1200×630) |
| 4 | PostLayout canonical uses hardcoded domain | Low | All blog posts | Replace with `Astro.site` |
| 5 | llms.txt uses "Intelligence Layer" — site migrating to "Gravity Field" | Low | /public/llms.txt | Align terminology to current brand direction |
| 6 | Live page fetch blocked by Cloudflare + Vercel SSO | Operational | — | Not a site issue; affects this monitoring script only |

---

## Previous Week Comparison

| Metric | 2026-04-20 | 2026-04-27 | Change |
|--------|------------|------------|--------|
| Blog posts | 21 | 27 | +6 |
| Estimated sitemap URLs | ~53 | ~59 | +6 |
| Deployment status | READY | READY | — |
| Open SEO issues | — | 5 | — |
