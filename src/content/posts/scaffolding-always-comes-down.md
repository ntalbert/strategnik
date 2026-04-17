---
title: "The Scaffolding Always Comes Down"
description: >-
  AI frameworks are commodity. Models are rented. The only thing in your marketing AI stack that compounds is your GTM ontology — the structured knowledge of how you win.
date: 2026-04-17T00:00:00.000Z
category: field-notes
featured: true
draft: false
image: /images/posts/scaffolding-always-comes-down.png
speakable:
  - "article h2:nth-of-type(1) + p"
  - "article h2:nth-of-type(2) + p"
  - "article h2:nth-of-type(3) + p"
---

The first time I saw a LangGraph diagram for a marketing agent, I counted twenty-three nodes. State machines, routing logic, fallback branches, a supervisor, three specialist sub-agents, a tool-calling layer, a retry loop, and a human-in-the-loop gate that never actually routed to a human. The team that built it was proud of it. They should have been. A year earlier, you needed that much scaffolding to get a model to reliably write an outbound email.

Six months later, the same team threw the whole thing out. Claude Code could do it in one prompt with four tools and no graph.

That's not a story about LangGraph. It's a story about what happens when the thing inside the scaffolding gets smarter than the scaffolding assumed. And it's happening right now, at the frontier of AI, in a way that has direct implications for how B2B marketing teams should think about what they're building.

Anthropic put the principle plainly: every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions go stale as models improve. The guardrails you built for a dumb model hobble a smart one. Scaffolding accumulates. Then, eventually, it comes down.

I think most B2B marketing teams are building the wrong thing right now, for the same reason.

## What the AI infrastructure crowd just figured out

Here's what's happening one layer below the marketing stack, in the world of AI engineering.

The frameworks — LangGraph, CrewAI, AutoGen, Semantic Kernel, the agent SDKs from OpenAI and AWS and Google — were necessary two years ago. Models couldn't hold multi-step plans. They couldn't recover from errors. They couldn't decide when to call a tool and when to think. So engineers built elaborate cages: orchestration graphs, state machines, routing logic, supervisor patterns. The cage made the dumb thing inside look smart.

Models got smarter. The cages started hobbling them.

![Diagram showing 23 interconnected agent-graph nodes on the left collapsing into a single model with four tools on the right — from engineered complexity to elegant simplicity](/images/posts/scaffolding-complex-to-simple.png)

The practitioners at the edge have noticed. They've collapsed the stack into a simpler pattern: a powerful model inside a powerful harness. Claude Code. Codex. A few tools. No graph. The assumption the cage was built around — *the model can't handle this on its own* — stopped being true.

But there's a second problem, and this is the one marketing leaders need to pay attention to.

Access to a computer isn't understanding. Give a smart agent a thousand documents and ask it a question, and it will search, guess, and confabulate. Multiply that across fifty agents with no shared model of the world, and you get something that's intelligent in isolation and incoherent in combination. Which is, not coincidentally, a reasonable description of what a lot of [AI-enabled marketing teams look like right now](/thinking/your-ai-is-still-a-chatbot).

The AI infrastructure crowd has a name for the fix: ontology. A structured, typed, linked model of the domain — what exists, what its properties are, how things relate. The agent doesn't search and hope. It queries a graph it can actually reason over.

Two symmetrical patterns. A powerful model inside a powerful harness, on one side. Powerful data inside a powerful ontology, on the other. Put them together and the agent stops generating and starts understanding.

That's the pattern at the frontier. Here's why it matters to you.

## The mass problem in AI-native GTM

I've been writing about the [Physics of Marketing](/thinking/physics-of-marketing-definitive-guide) for a while. The short version: GTM systems behave like physical systems. Mass, surface area, velocity, escape velocity. Light systems produce erratic results. Heavy systems dampen variance and compound over time.

Mass, in GTM terms, is the accumulated weight of what your company knows about itself and its market. Who you sell to. Why you win. What your buyers actually believe before they talk to you. How your competitors position against you. What each channel is for. What every metric means, and what number triggers action.

Most B2B marketing organizations carry this mass in the wrong places. It's in the head of the VP Marketing. It's in a deck that got used twice and then sat in a shared drive. It's in a Notion page nobody updates. It's in Slack threads that scrolled off the screen. It's in the muscle memory of three senior ICs who are about to leave.

That was fine when humans did the work. Humans can infer. They can ask. They can read the room. Agents can't. Agents need the mass to be *structured* — typed, linked, queryable — or they produce exactly what the AI infrastructure people are warning about: fifty tools doing plausible-sounding work, none of them sharing a model of the world, all of them drifting in slightly different directions.

The result is the thing I hear from every marketing leader running AI pilots right now: *output went up, pipeline didn't move*. Five teams interpreting the same brief five different ways, now doing it faster.

The problem isn't the tools. The problem is that the mass isn't there to anchor them.

## What's commodity and what isn't

Here's the part that changes how you should be investing.

Everyone has access to the same frontier models. GPT, Claude, Gemini — they're rented, they're swappable, they get replaced every twelve months. That's commodity, and the cost of that commodity is dropping roughly 4x per year.

Everyone can build a harness. Claude Code exists. Agent SDKs exist. The tooling gap between "sophisticated AI team" and "competent AI team" is closing fast. That's commodity too.

![Three-layer stack showing Models (commodity, rented) and Harness (replaceable) floating above Ontology — the only layer with gravity, roots, and permanence](/images/posts/scaffolding-commodity-vs-owned.png)

What isn't commodity — what cannot be bought, rented, or copied — is your domain model. Your ontology. The structured representation of how *your* company understands its market, its buyers, its competitors, its message, its metrics. That has to be built. It has to be maintained. And it only works for you.

Every dollar your team spends on a new framework, a new agent builder, a new AI-native marketing point solution, is a dollar you could have spent building mass that compounds. The framework will be commodity in a year. The ontology will still be working for you in five.

## The Intelligence Layer as GTM ontology

This is what I've been building with clients under the name [Intelligence Layer](/thinking/six-components-of-an-intelligence-layer). I didn't call it an ontology when I started — I called it a [machine-readable operating context](/thinking/context-engineering-vs-intelligence-layer). Same idea, different vocabulary.

Six components. Brand spec. ICP hierarchy. Competitive framing. Content architecture. Distribution schema. Measurement targets. Each one captured in two forms: a human-readable narrative for the CMO and the board, and a structured, machine-readable specification for every AI tool in the stack.

![Dual-format architecture showing six Intelligence Layer components each forking into human-readable outputs for the CMO and machine-readable outputs for AI agents and CRM systems](/images/posts/scaffolding-intelligence-layer-dual.png)

The ICP isn't a paragraph in a deck. It's a typed taxonomy with scoring logic, trigger events, and disqualification rules, exportable to the CRM, the enrichment stack, and the agent prompts. Every tool scores the same lead the same way.

The competitive framing isn't a battlecard. It's a typed graph — competitor, claim, evidence, counter, proof point — that a sales agent can query, a content system can cite, and an [answer-engine optimization](/thinking/gtm-architect-guide-answer-engine-optimization) pipeline can structure into schema markup. When a new competitor emerges, you extend the graph. You don't rewrite thirty battlecards.

The measurement targets aren't a dashboard. They're metric definitions with formulas, source bindings, and alert logic, readable by humans and by agents. Every dashboard, every standup, every QBR runs on the same numbers with the same definitions.

This is mass, in a form agents can actually use. It's the thing that turns fifty agents from incoherent combination into coordinated system.

## What you should do differently this quarter

Two things.

First, stop evaluating AI-native marketing tools as features. Evaluate them as load on your ontology. If a tool requires you to re-explain your ICP, your voice, your competitive positioning, your metrics — in its own schema, in its own way — it's adding scaffolding, not mass. The tools that will survive the next two years are the ones that consume a structured context you own and bring back structured output you can integrate. If the tool can't do that, it's a transient phase.

Second, if you're the CMO or the founder deciding between hiring a marketing leader and investing in an AI-native system, the question isn't which one to pick. The question is whether either one is going to produce the ontology, or just consume it. A CMO hire who will write down how the company understands its market, its buyers, and its wins — in a form the rest of the stack can operate from — is worth the salary. A CMO hire who will keep all that in their head and leave in eighteen months is a scaffolding cost.

The frameworks are commodity. The models are rented. The only durable thing in AI-native GTM is the structured knowledge of how your company wins. Build that, and everything you bolt on top compounds. Skip it, and every tool you buy is load-bearing until the day it isn't.

Scaffolding always comes down. Mass is what stays.
