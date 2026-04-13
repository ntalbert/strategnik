---
title: 'When Frictionless Breaks: The Signal Problem in B2B PLG'
description: >-
  The PLG orthodoxy says remove all friction. But when your API is too easy to hit, you get usage data that looks great and predicts nothing. Deliberate friction isn't the enemy of product-led growth. It's what makes the data trustworthy.
date: 2026-04-12T00:00:00.000Z
category: physics
featured: false
image: /images/posts/when-frictionless-breaks-plg.png
speakable:
  - "h1"
  - "h2"
---

I once worked with a company that had built, by any standard metric, an exceptional developer experience. The API was clean. Documentation was thorough. A developer could go from signup to first successful API call in under fifteen minutes. Time-to-value was world-class. The growth dashboard looked incredible.

The business was not incredible. Conversion from free to paid was anemic. The sales team was chasing hundreds of "active" accounts that had no intention of buying. Engineering was scaling infrastructure to handle usage that generated zero revenue. And the executive team was staring at a funnel that, on paper, should have been working but wasn't.

The problem wasn't that the product was bad. The problem was that the product was too easy to use for the wrong reasons. The API was so frictionless that it attracted a massive volume of casual experimentation: developers testing it for side projects, competitors benchmarking it, students using it for coursework, teams evaluating six vendors simultaneously with no intent to buy any of them. All of this looked like activation. None of it was.

The signal-to-noise ratio had collapsed, and nobody could tell the difference.

## The Frictionless Orthodoxy

Product-led growth has a founding assumption: remove friction and the product sells itself. Lower the barrier to entry. Let users experience value before they talk to sales. Make the free tier generous enough that word-of-mouth does the distribution. Time-to-value is the north star metric. Every step between signup and "aha moment" is a leak to be plugged.

This is largely correct, and for consumer products, it's almost always correct. But B2B PLG operates under constraints that consumer PLG does not. The buyer and the user are often different people. The budget holder needs justification that "I liked using it" doesn't provide. The purchasing decision involves security reviews, compliance checks, procurement processes, and integration requirements that no amount of frictionless onboarding eliminates. And the usage data that's supposed to signal buying intent only works as a signal if the usage itself is meaningful.

When you remove all friction from a B2B product, you don't just lower the barrier for good-fit customers. You lower it for everyone. And "everyone" includes a long tail of users who will never buy, whose usage patterns are indistinguishable from real prospects at the metrics level, and whose presence in your data makes every downstream decision worse.

## What Happens When Signal Collapses

The damage from collapsed signal quality is specific and cascading.

**Sales wastes cycles on phantom intent.** Product-qualified leads based on usage thresholds (made 50 API calls, created 3 projects, invited a teammate) stop predicting conversion. The sales team calls these "leads" and discovers that half of them are students, a quarter are competitors, and the rest are developers who integrated the free tier into a personal project and have no purchasing authority. After enough of these conversations, the sales team stops trusting the PQL system entirely, which means they also miss the real prospects buried in the noise.

**Usage metrics become vanity metrics.** Monthly active users goes up. Revenue doesn't. The board sees a chart showing exponential adoption and asks why it isn't converting. The honest answer is that most of the "adoption" is tire-kicking, but that's hard to say when the company's narrative is built around PLG momentum. So the team optimizes for more of the same: more signups, more API calls, more "engagement." The metric becomes self-reinforcing and self-deceiving.

**Infrastructure scales for the wrong load.** Engineering provisions servers, optimizes endpoints, and builds rate-limiting systems to handle traffic that has no revenue potential. This isn't free. It's engineering time that could be spent on features that paying customers need, and it's cloud spend that shows up as cost of goods sold against revenue that doesn't exist.

**ICP definition blurs.** When your free tier attracts everyone, your usage data can't tell you who your real customer is. Product decisions get made based on the aggregate behavior of a user base that's 80% non-buyers. Features get prioritized for use cases that will never monetize. The product drifts toward generality instead of deepening the value for the customers who actually pay.

![Process friction versus signal friction — not all friction is created equal in B2B PLG](/images/posts/plg-friction-signal-architecture.png)

## Friction as Signal Architecture

The [friction piece](/thinking/friction-problem) I wrote covers the compound cost of unnecessary friction in the buyer journey: how it trains the market that you're hard to work with, how it destroys [momentum](/physics-of-growth/momentum) you've spent months building. Everything in that piece is true, and for sales-led motions, friction reduction is almost always the highest-leverage investment.

But in B2B PLG, friction serves a second function that has nothing to do with the buyer's experience. It serves as signal architecture. Deliberate, well-placed friction separates serious evaluation from casual experimentation at the point of entry, before the data gets polluted and before the sales team wastes cycles on noise.

This is not the same as "make it hard to use your product." It's closer to "make it easy to use your product for the right reasons, and slightly less easy for the wrong ones."

The distinction matters because the PLG orthodoxy treats all friction as equivalent. A twelve-field form and a requirement to use a work email are both "friction." But they're doing completely different things. The form is collecting data for your lead-scoring model. The work email requirement is filtering out the 40% of signups who were never going to buy. One is process friction imposed on the buyer. The other is signal friction that benefits everyone, including the user, because the product experience improves when the user base is composed of people who actually need the product.

![Four strategic friction points in B2B PLG: signup, integration boundary, free-to-paid wall, and team expansion](/images/posts/plg-deliberate-friction-points.png)

## Where Deliberate Friction Works

The companies that run effective B2B PLG motions tend to have friction in specific, considered places. Not everywhere. Not nowhere. In the places where signal quality matters most.

**At the point of signup.** Requiring a work email is the simplest version. Asking for a company name and use case adds a few seconds of friction and eliminates a significant percentage of noise. The developers who are serious don't mind. The ones who bounce were never going to convert. This is a trade you should make every time, and yet a surprising number of B2B PLG companies don't, because the signup conversion rate looks worse and that metric has a constituency.

**At the boundary between exploration and integration.** Letting someone explore the product in a sandbox is frictionless and should be. Letting someone integrate the product into their production environment is a different action with different implications. The step from "I'm trying this" to "I'm building on this" is where intent becomes real. Adding a lightweight qualification step at this boundary (even something as simple as "tell us about your use case" or requiring an API key tied to a verified account) doesn't slow down serious buyers. It reveals who they are.

**At the transition from free to paid.** The free tier should be generous enough to demonstrate value. It should not be generous enough to eliminate the need to pay. This sounds obvious, but calibrating where the wall sits is one of the hardest decisions in PLG. Too low and nobody experiences the value. Too high and nobody needs to convert. The wall itself is friction, and it's the most important piece of friction in the entire motion because it's the moment where usage either becomes revenue or confirms that it never was going to.

**At the point of team expansion.** A single user on a free plan is an experiment. A team of five on a free plan is either a serious evaluation or a company that's learned to work around your paywall. Friction at the team boundary (requiring an admin to approve new seats, triggering a conversation with sales when the account exceeds a threshold, gating collaboration features behind a paid tier) forces the question: is this a team that wants to buy, or a team that wants to stay free forever? Both are fine. But you need to know which one you're looking at.

## The Measurement Problem

The reason companies resist deliberate friction is that it makes the top-of-funnel metrics look worse. Signups drop. Time-to-first-value increases. Monthly active users flatten. If you're reporting to a board that evaluates PLG health based on these numbers, introducing friction feels like regression.

This is a [funnel math](/thinking/funnel-math-kills-the-deal) problem. The numbers that look worse at the top (fewer signups, fewer free users) should produce numbers that look dramatically better in the middle and bottom (higher PQL-to-opportunity conversion, shorter sales cycles, higher win rates, better expansion revenue). If you're measuring the full funnel, deliberate friction is a net positive. If you're only measuring the top, it looks like you're breaking something.

The companies that navigate this well tend to reframe the metrics before they introduce the friction. They stop reporting raw signups and start reporting qualified signups. They stop tracking total API calls and start tracking API calls by account segment. They build dashboards that show conversion quality, not just conversion volume. The metrics shift is a prerequisite, not an afterthought, because if the board is still watching the vanity numbers when you tighten the free tier, the friction will get rolled back before it has time to prove its value.

## The Physics of It

In the [Physics of Marketing](/thinking/physics-of-marketing-definitive-guide) framework, friction is a force that opposes motion. The default framing is that friction is destructive: it converts interested prospects into lost opportunities, dissipates [momentum](/physics-of-growth/momentum), and trains the market to look elsewhere.

That framing holds for friction that's imposed without purpose. Forms nobody reads. Meetings nobody needs. Process that exists because someone built it five years ago and nobody questioned it.

But forces aren't inherently good or bad. Friction in a braking system is what stops a car from going off a cliff. Friction in a joint is what holds a structure together. The question isn't whether friction exists in your growth system. It's whether the friction is doing useful work.

In B2B PLG, deliberate friction does three things that frictionless cannot: it generates clean signal about who's serious, it concentrates your resources on the users most likely to convert, and it produces usage data that actually predicts revenue. Those are not minor advantages. They're the difference between a PLG motion that compounds and one that generates impressive charts on the way to a down round.

The orthodoxy says remove all friction. The physics say apply friction where it does useful work, and remove it everywhere else.

---

*Nick Talbert is a GTM strategist and the founder of [Strategnik](https://strategnik.com). He advises B2B SaaS founders and revenue leaders on go-to-market strategy, positioning, and growth architecture.*
