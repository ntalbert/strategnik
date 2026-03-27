# Strategnik — Project Context for Claude Code

## What This Is
Strategnik is Nick Talbert's GTM consulting practice and personal brand platform. The site (strategnik.com) is the public face of the practice and hosts thought leadership content built around the **"Physics of Marketing"** framework.

## Domain
- strategnik.com (Cloudflare DNS)
- [TODO: Add staging URL if applicable]

## Tech Stack
- Framework: Astro
- Styling: Tailwind CSS
- Animation: Motion (`motion/react`) — required for all animations and transitions. No CSS keyframe animations or other libraries.
- [TODO: Add CMS or content pipeline if applicable]
- [TODO: Add deployment target — Cloudflare Pages, Vercel, etc.]

## Motion Conventions (Strategnik)
- Use scroll-triggered `whileInView` for section reveals as users scroll the site
- Page transitions via `AnimatePresence mode="wait"` on route changes
- Subtle hover states on CTAs and cards — `whileHover={{ scale: 1.02 }}`, not flashy
- Staggered list reveals for case studies, blog posts, service cards
- Keep animations professional and restrained — this is a B2B consulting brand, not a portfolio flex
- Duration range: 0.2s–0.4s for interactions, 0.4s–0.6s for section reveals
- Respect `prefers-reduced-motion` — use `useReducedMotion()` hook

## Physics of Marketing Framework
This is the core intellectual property of Strategnik. It applies physics concepts to B2B GTM dynamics:
- **Mass** — the weight/credibility of a brand or offer
- **Surface Area** — how much of the market you're in contact with
- **Escape Velocity** — the momentum needed to break out of a market
- **Friction** — resistance in the buyer journey or sales motion
- **Momentum** — compounding pipeline and brand effects

All content should be consistent with and reinforce this framework. Never contradict or dilute it.

## Brand Voice
- Expert but not academic
- Direct and opinionated — Strategnik has a clear point of view
- B2B fluent — audience is founders, CROs, and senior marketing leaders
- Not consultant-speak — avoid vague, hedge-everything language

## Active Clients (as of early 2026)
- **Codiac** — Kubernetes/AI agent orchestration platform
- **Navix** — Freight audit SaaS

## Site Content Structure
- [TODO: Add your actual page/content structure — e.g., /blog, /services, /case-studies]

## File/Folder Conventions
- [TODO: Add your Astro project structure]

## What Not to Touch
- [TODO: Flag any files or configs that should not be modified without explicit instruction]

## Notes for Claude Code
- This is Nick's personal brand — tone and positioning consistency matter as much as functionality.
- The Physics of Marketing framework is non-negotiable IP. Reinforce it; never water it down.
- Blog posts and content pieces should follow the Strategnik voice above — not generic marketing blog style.
- When adding features or pages, ask whether they serve the primary audience: founders and CROs evaluating GTM help.
