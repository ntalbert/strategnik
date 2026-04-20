# Strategnik Weekly SEO Health Report
**Date:** 2026-04-20 (Monday)
**Checked by:** Claude Code automated audit

---

## 1. Sitemap

**sitemap-index.xml** — `200 OK` ✓  
References one child sitemap: `https://strategnik.com/sitemap-0.xml`

**sitemap-0.xml** — ⚠️ Could not be fetched via automated tools  
Vercel MCP returns "Unable to create shareable URL" for XML files. Cloudflare WAF blocks the standard WebFetch tool (403). URL count could not be machine-verified this run.

**Estimated URL count (from repo):** ~35–40
- 22 blog posts (`src/content/posts/`)
- ~6 case study pages
- ~8–10 static pages (/, /thinking/, /intelligence-layer/, /gravity-audit/, /physics-of-growth/, /services/, /playbooks/, /case-studies/, /pricing, /physics-of-growth/momentum, etc.)

**Action required:** Manually verify sitemap-0.xml URL count at `https://strategnik.com/sitemap-0.xml` or add a script that fetches it via curl. Consider adding sitemap URL count to an automated health check that runs server-side.

---

## 2. robots.txt

**Status:** `200 OK` ✓  
**Last-Modified:** Sun, 19 Apr 2026

| Bot | Directive |
|-----|-----------|
| Googlebot | Allow / ✓ |
| GPTBot | Allow / ✓ |
| ClaudeBot | Allow / ✓ |
| PerplexityBot | Allow / ✓ |
| * (all others) | Allow / ✓ |

**Blocked paths:** `/api/`, `/GTMengineoption1`, `/GTMengineoption2`  
**Sitemap reference:** `https://strategnik.com/sitemap-index.xml` ✓

No issues.

---

## 3. Key Page Spot-Checks

All 5 pages return `200 OK` and pass all SEO tag checks.

| Page | 200 | Title | Meta Desc | Canonical | OG Tags | JSON-LD |
|------|:---:|:-----:|:---------:|:---------:|:-------:|:-------:|
| / | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| /thinking/ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ Org+Person |
| /intelligence-layer/ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| /gravity-audit/ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ Service+FAQ+Breadcrumb |
| /physics-of-growth/ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Homepage title:** "Strategnik — GTM Architecture & the Intelligence Layer for AI-Native Marketing"  
**Intelligence Layer title:** "The Intelligence Layer — What AI Agents Actually Need to Run Your Marketing | Strategnik"  
**Gravity Audit title:** "The Gravity Audit™ — AI Visibility & GTM Diagnostic for B2B SaaS | Strategnik"  
**Physics of Growth title:** "The Physics of Growth — A Framework for GTM Investment Decisions | Strategnik"

**Minor flag — /gravity-audit/ CTA:**  
The "Book a call →" CTA links to `https://calendar.app.google` (generic placeholder). This likely needs to be replaced with the actual booking link.

---

## 4. Blog Post Spot-Checks (5 random)

| Post | 200 | Title | Meta Desc | Canonical | OG (per-post image) | Article JSON-LD |
|------|:---:|:-----:|:---------:|:---------:|:-------------------:|:---------------:|
| /thinking/friction-problem/ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| /thinking/inflection-points/ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| /thinking/funnel-math-kills-the-deal/ | ⚠️ | — | — | — | — | — |
| /thinking/from-chatbot-to-agent-fleet/ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| /thinking/why-ai-made-marketing-faster-not-better/ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Positive:** All verified posts have per-post OG images (not the fallback og-default.png) and full Article schema with `speakable` selectors. Canonical URLs are correct.

**⚠️ funnel-math-kills-the-deal:** Vercel MCP returned "Unable to create shareable URL" — this is a tool limitation, not confirmed as a 404. The post appears in the /thinking/ listing. Manual verification recommended: visit `https://strategnik.com/thinking/funnel-math-kills-the-deal/` directly.

---

## 5. New Content (Last 7 Days: Apr 13–20)

**22 new posts added this week.** Frontmatter checked on sampled posts — all pass.

### New/Rewritten Post (Apr 17)
| Field | Status |
|-------|--------|
| **why-ai-made-marketing-faster-not-better** | |
| title | ✓ "Why AI Made Your Marketing Faster — But Not Better" |
| description | ✓ (139 chars) |
| image | ✓ `/images/posts/why-ai-made-marketing-faster-not-better.png` |
| category | ✓ `field-notes` |
| date | ✓ `2026-04-17` |
| speakable | ✓ 3 selectors |
| Redirect from old URL | ✓ `/thinking/scaffolding-always-comes-down` → `/thinking/why-ai-made-marketing-faster-not-better` |

### Large Batch (Apr 13 — 21 new posts)
All sampled posts have complete required frontmatter. Two posts are missing the optional `draft: false` field:
- `ai-collapsing-gtm-walls.md` — no `draft` field (live and indexed, non-blocking)
- `chief-marketing-orchestrator.md` — no `draft` field (live and indexed, non-blocking)

**Full list of new posts published this week:**
1. `why-ai-made-marketing-faster-not-better` (Apr 17) — new flagship post
2. `aeo-statistics-b2b-saas-2026`
3. `ai-collapsing-gtm-walls`
4. `b2b-gtm-metrics-benchmark-2026`
5. `chief-marketing-orchestrator`
6. `context-engineering-vs-intelligence-layer`
7. `fractional-cmo-cost-2026`
8. `fractional-cmo-first-90-days`
9. `fractional-cmo-vs-gtm-consultant`
10. `friction-problem`
11. `from-chatbot-to-agent-fleet`
12. `funnel-math-kills-the-deal`
13. `gtm-architect-guide-answer-engine-optimization`
14. `inflection-points`
15. `momentum-marketing-investments`
16. `physics-of-marketing-definitive-guide`
17. `six-components-of-an-intelligence-layer`
18. `stage-appropriate-gtm-metrics-saas`
19. `when-frictionless-breaks-plg`
20. `why-b2b-content-doesnt-show-up-in-chatgpt`
21. `why-gtm-leaders-churn-early-stage-saas`
22. `your-ai-is-still-a-chatbot`

Cross-links were wired across all 22 posts (commit `38751a8`).

---

## 6. Vercel Deployment Status

**Latest deployment:** `dpl_6nFuLrdT1Xd1a98Y89Bc6PWUArGn`  
**State:** `READY` ✓  
**Triggered by:** Commit "Social post: 2026-04-19" (github-actions[bot])  
**Target:** production  
**Deployed:** 2026-04-19

**Recent deployment health:** All 20 most recent deployments show `READY`. Zero failures in the visible window. Daily social post automation is deploying cleanly.

---

## 7. llms.txt

**Status:** `200 OK` ✓  
**URL:** `https://strategnik.com/llms.txt`

**Coverage assessment:** Comprehensive ✓
- About / practice overview ✓
- Intelligence Layer definition ✓ (detailed, all 6 components listed)
- Physics of Growth framework ✓ (Mass, Surface Area, Escape Velocity, Friction, Momentum)
- Services ✓ (Gravity Audit, IL Diagnostic, IL Sprint, Advisor Retainer)
- Key pages with URLs ✓
- Expertise / Nick's background ✓
- Key concepts / positioning statements ✓

No issues. Well-structured for AI citation.

---

## Issues Summary

| Priority | Issue | Action |
|----------|-------|--------|
| 🔴 ACTION | /gravity-audit/ CTA links to `https://calendar.app.google` (placeholder) | Replace with real booking link |
| 🟡 VERIFY | sitemap-0.xml could not be auto-fetched (XML/Cloudflare limitation) | Manual check or server-side script |
| 🟡 VERIFY | /thinking/funnel-math-kills-the-deal/ — could not auto-verify (Vercel URL issue) | Manual visit to confirm 200 |
| 🟢 MINOR | 2 posts missing `draft: false` frontmatter field | Non-blocking; add for consistency |

---

## Previous Report
- [weekly-health-2026-04-13.md](./weekly-health-2026-04-13.md)
